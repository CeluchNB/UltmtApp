import * as Constants from '../utils/constants'
import { Game } from '../types/game'
import Point from '../types/point'
import { selectManagerTeams } from '../store/reducers/features/account/accountReducer'
import useLivePoint from '../hooks/useLivePoint'
import usePointSocket from '../hooks/usePointSocket'
import { useQuery } from 'react-query'
import useSavedPoint from '../hooks/useSavedPoint'
import { Action, ActionFactory, ServerActionData } from '../types/action'
import React, { createContext, useEffect, useMemo, useState } from 'react'
import {
    deleteLocalActionsByPoint,
    getLiveActionsByPoint,
} from '../services/data/point'
import {
    getGameById,
    getPointsByGame,
    logGameOpen,
} from '../services/data/game'
import { isLivePoint, normalizeActions } from '../utils/point'
import {
    setLiveAction,
    setSavedAction,
    setTeams,
} from '../store/reducers/features/action/viewAction'
import { useDispatch, useSelector } from 'react-redux'

interface GameViewContextData {
    displayActions: (Action | { ad: boolean })[]
    game?: Game
    activePoint?: Point
    points: Point[]
    gameLoading: boolean
    activePointLoading: boolean
    allPointsLoading: boolean
    gameError: string
    pointError: string
    managingTeamId?: string
    onSelectAction: (action: ServerActionData) => {
        gameId: string
        pointId: string
        live: boolean
    }
    onSelectPoint: (pointId: string) => Promise<void>
    onRefresh: () => Promise<void>
}

export const GameViewContext = createContext<GameViewContextData>({
    displayActions: [],

    game: undefined,
    activePoint: undefined,
    points: [],
    gameLoading: false,
    activePointLoading: false,
    allPointsLoading: false,
    gameError: '',
    pointError: '',
    managingTeamId: undefined,
    onSelectAction: () => ({ gameId: '', pointId: '', live: false }),
    onSelectPoint: async () => {},
    onRefresh: async () => {},
})

const GameViewProvider = ({
    children,
    gameId,
}: {
    children: React.ReactNode
    gameId: string
}) => {
    const dispatch = useDispatch()
    const managerTeams = useSelector(selectManagerTeams)
    const [activePoint, setActivePoint] = useState<Point>()
    const emitter = usePointSocket(gameId, activePoint?._id ?? '')
    const { actionStack, setActionStack } = useLivePoint(emitter)
    const {
        teamOneActions: teamOneSavedActions,
        teamTwoActions: teamTwoSavedActions,
        loading: savedPointLoading,
        error: savedPointError,
    } = useSavedPoint(activePoint)

    const [game, setGame] = React.useState<Game>()
    const [points, setPoints] = React.useState<Point[]>([])

    const [gameLoading, setGameLoading] = React.useState(false)
    const [allPointsLoading, setAllPointsLoading] = React.useState(false)
    const [gameError, setGameError] = React.useState('')

    const enabled = activePoint && isLivePoint(activePoint)
    const { isLoading: livePointLoading, error: livePointError } = useQuery(
        [{ liveActionByPoint: { gameId, pointId: activePoint?._id } }],
        () => getLiveActionsByPoint(gameId, activePoint?._id ?? ''),
        {
            enabled: enabled !== undefined,
            onSuccess(data) {
                const teamOneActions = data.filter(a => a.teamNumber === 'one')
                const teamTwoActions = data.filter(a => a.teamNumber === 'two')
                setActionStack({
                    ...actionStack.addTeamOneActions(teamOneActions),
                })
                setActionStack({
                    ...actionStack.addTeamTwoActions(teamTwoActions),
                })
            },
        },
    )

    const pointError = useMemo(() => {
        return (
            (savedPointError as any)?.message ??
            (livePointError as any)?.message
        )
    }, [savedPointError, livePointError])

    const managingTeamId = useMemo(() => {
        const teamOneId = managerTeams.find(
            team => team._id === game?.teamOne._id,
        )?._id
        if (teamOneId) return teamOneId

        if (game?.teamTwo?._id) {
            return managerTeams.find(team => team._id === game.teamTwo?._id)
                ?._id
        }
        return undefined
    }, [game, managerTeams])

    useEffect(() => {
        initializeGame()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        return () => {
            for (const point of points) {
                deleteLocalActionsByPoint(point._id)
            }
        }
    }, [points])

    const displayActions = React.useMemo(() => {
        if (!activePoint) return []

        if (isLivePoint(activePoint)) {
            const teamOneActions = actionStack.getTeamOneActions()
            const teamTwoActions = actionStack.getTeamTwoActions()

            const teamOneDisplayActions = teamOneActions.map(a =>
                ActionFactory.createFromAction(a),
            )
            const teamTwoDisplayActions = teamTwoActions.map(a =>
                ActionFactory.createFromAction(a),
            )

            return normalizeActions(
                teamOneDisplayActions,
                teamTwoDisplayActions,
            )
        } else {
            return normalizeActions(
                teamOneSavedActions ?? [],
                teamTwoSavedActions ?? [],
            )
        }
    }, [actionStack, activePoint, teamOneSavedActions, teamTwoSavedActions])

    const initializeGame = async () => {
        try {
            setGameError('')
            setGameLoading(true)
            setAllPointsLoading(true)

            const gameData = await getGameById(gameId)
            setGame(gameData)

            const pointsData = await getPointsByGame(gameId)
            setPoints(pointsData)

            // fire and forget this log
            logGameOpen(gameId)
        } catch (e: any) {
            setGameError(e?.message ?? Constants.GET_GAME_ERROR)
        } finally {
            setAllPointsLoading(false)
            setGameLoading(false)
        }
    }

    const onSelectPoint = async (pointId: string) => {
        const point = getPointById(pointId)
        if (!point) return

        setActivePoint(point)
    }

    const onSelectAction = (
        action: ServerActionData,
    ): { gameId: string; pointId: string; live: boolean } => {
        const live = isLivePoint(activePoint)
        if (live) {
            dispatch(
                setTeams({ teamOne: game?.teamOne, teamTwo: game?.teamTwo }),
            )
            dispatch(setLiveAction(action))
        } else {
            dispatch(setSavedAction(action))
        }
        return { gameId, pointId: activePoint?._id || '', live }
    }

    const onRefresh = async () => {
        await initializeGame()
        if (activePoint) {
            await onSelectPoint(activePoint?._id)
        }
    }

    // private
    const getPointById = (id: string): Point | undefined => {
        return points.find(p => p._id === id)
    }

    return (
        <GameViewContext.Provider
            value={{
                displayActions,
                game,
                points,
                gameLoading,
                activePointLoading: livePointLoading || savedPointLoading,
                allPointsLoading,
                gameError,
                activePoint,
                managingTeamId,
                pointError,
                onSelectAction,
                onSelectPoint,
                onRefresh,
            }}>
            {children}
        </GameViewContext.Provider>
    )
}

export default GameViewProvider
