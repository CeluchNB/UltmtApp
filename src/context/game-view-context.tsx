import ActionStack from '../utils/action-stack'
import { Game } from '../types/game'
import Point from '../types/point'
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
    selectAccount,
    selectManagerTeams,
} from '../store/reducers/features/account/accountReducer'
import {
    setLiveAction,
    setSavedAction,
    setTeams,
} from '../store/reducers/features/action/viewAction'
import { useDispatch, useSelector } from 'react-redux'

interface GameViewContextData {
    userId?: string
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
    onSelectPoint: (pointId: string) => void
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
    onSelectPoint: () => {},
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
    const account = useSelector(selectAccount)
    const [activePoint, setActivePoint] = useState<Point>()
    const emitter = usePointSocket(
        gameId,
        activePoint && isLivePoint(activePoint) ? activePoint?._id : '',
    )
    const { actionStack, setActionStack } = useLivePoint(emitter, {
        onNextPoint: () => {
            setActivePoint(undefined)
            refetchGame()
            refetchPoints()
        },
    })
    const {
        teamOneActions: teamOneSavedActions,
        teamTwoActions: teamTwoSavedActions,
        loading: savedPointLoading,
        error: savedPointError,
    } = useSavedPoint(activePoint)

    const {
        data: game,
        isLoading: gameLoading,
        error: gameError,
        refetch: refetchGame,
    } = useQuery([{ getGameById: gameId }], () => getGameById(gameId))

    const {
        data: points,
        isLoading: allPointsLoading,
        refetch: refetchPoints,
    } = useQuery([{ getPointsByGame: gameId }], () => getPointsByGame(gameId), {
        onSuccess(newPoints) {
            newPoints.sort((a, b) => b.pointNumber - a.pointNumber)
            if (
                !activePoint &&
                newPoints.length > 0 &&
                isLivePoint(newPoints[0])
            ) {
                setActionStack(new ActionStack())
                setActivePoint(newPoints[0])
            }
        },
    })

    const {
        isLoading: livePointLoading,
        error: livePointError,
        refetch: refetchLiveActions,
    } = useQuery(
        [{ liveActionByPoint: { gameId, pointId: activePoint?._id } }],
        () => getLiveActionsByPoint(gameId, activePoint?._id ?? ''),
        {
            enabled: isLivePoint(activePoint),
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
        logGameOpen(gameId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        return () => {
            if (!points) return

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

    const onSelectPoint = (pointId: string) => {
        const point = getPointById(pointId)
        if (!point) return

        setActivePoint(point)
        if (isLivePoint(point)) {
            refetchLiveActions()
        }
    }

    const onSelectAction = (
        action: ServerActionData,
    ): { gameId: string; pointId: string; live: boolean } => {
        const live = isLivePoint(activePoint)
        dispatch(setTeams({ teamOne: game?.teamOne, teamTwo: game?.teamTwo }))
        if (live) {
            dispatch(setLiveAction(action))
        } else {
            dispatch(setSavedAction(action))
        }
        return { gameId, pointId: activePoint?._id || '', live }
    }

    const onRefresh = async () => {
        refetchGame()
        refetchPoints()
        if (activePoint) {
            onSelectPoint(activePoint?._id)
        }
    }

    // private
    const getPointById = (id: string): Point | undefined => {
        return points?.find(p => p._id === id)
    }

    return (
        <GameViewContext.Provider
            value={{
                userId: account._id,
                displayActions,
                game,
                points: points ?? [],
                gameLoading,
                activePointLoading: livePointLoading || savedPointLoading,
                allPointsLoading,
                gameError:
                    (gameError as any)?.message ?? gameError?.toString() ?? '',
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
