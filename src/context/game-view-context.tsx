import { Game } from '../types/game'
import Point from '../types/point'

import { selectManagerTeams } from '../store/reducers/features/account/accountReducer'
import usePoint from '../hooks/usePoint'
import usePointSocket from '../hooks/usePointSocket'
import { useSelector } from 'react-redux'
import { Action, ActionFactory } from '../types/action'
import React, { createContext, useEffect, useState } from 'react'
import {
    deleteLocalActionsByPoint,
    getLiveActionsByPoint,
    getViewableActionsByPoint,
} from '../services/data/point'
import {
    getGameById,
    getPointsByGame,
    logGameOpen,
} from '../services/data/game'
import { isLivePoint, normalizeActions } from '../utils/point'

interface GameViewContextData {
    displayActions: (Action | { ad: boolean })[]
    game?: Game
    activePoint?: Point
    points: Point[]
    gameLoading: boolean
    activePointLoading: boolean
    allPointsLoading: boolean
    error: string
    managingTeamId?: string
    onSelectPoint: (pointId: string) => void
}

export const GameViewContext = createContext<GameViewContextData>({
    displayActions: [],
    onSelectPoint: () => {},
    game: undefined,
    activePoint: undefined,
    points: [],
    gameLoading: false,
    activePointLoading: false,
    allPointsLoading: false,
    error: '',
    managingTeamId: undefined,
})

const GameViewProvider = ({
    children,
    gameId,
}: {
    children: React.ReactNode
    gameId: string
}) => {
    const managerTeams = useSelector(selectManagerTeams)
    const [activePoint, setActivePoint] = useState<Point>()
    const emitter = usePointSocket(gameId, activePoint?._id ?? '')
    const { actionStack, setActionStack } = usePoint(emitter)

    const [game, setGame] = React.useState<Game>()
    const [points, setPoints] = React.useState<Point[]>([])

    const [gameLoading, setGameLoading] = React.useState(false)
    const [allPointsLoading, setAllPointsLoading] = React.useState(false)
    const [activePointLoading, setActivePointLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const managingTeamId = React.useMemo(() => {
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

        const teamOneActions = actionStack.getTeamOneActions()
        const teamTwoActions = actionStack.getTeamTwoActions()

        const teamOneDisplayActions = teamOneActions.map(a =>
            ActionFactory.createFromAction(a),
        )
        const teamTwoDisplayActions = teamTwoActions.map(a =>
            ActionFactory.createFromAction(a),
        )

        return normalizeActions(teamOneDisplayActions, teamTwoDisplayActions)
    }, [actionStack, activePoint])

    const initializeGame = async () => {
        try {
            setGameLoading(true)
            setAllPointsLoading(true)

            const gameData = await getGameById(gameId)
            setGame(gameData)

            const pointsData = await getPointsByGame(gameId)
            setPoints(pointsData)

            const openedGame = await logGameOpen(gameId)
            if (openedGame) {
                setGame(openedGame)
            }
        } catch (e: any) {
            setError(e?.message)
        } finally {
            setAllPointsLoading(false)
            setGameLoading(false)
        }
    }

    const onSelectPoint = async (pointId: string) => {
        const point = getPointById(pointId)
        if (!point) return

        if (isLivePoint(point)) {
            const data = await getLiveActionsByPoint(gameId, pointId)
            const teamOneActions = data.filter(a => a.teamNumber === 'one')
            const teamTwoActions = data.filter(a => a.teamNumber === 'two')
            setActionStack({ ...actionStack.addTeamOneActions(teamOneActions) })
            setActionStack({ ...actionStack.addTeamTwoActions(teamTwoActions) })
        } else {
            await getSavedActions(point)
        }
        setActivePoint(point)
    }

    const getSavedActions = async (point: Point) => {
        const oneActions = await getViewableActionsByPoint(
            'one',
            point._id,
            point.teamOneActions,
        )
        // setTeamOneActions(oneActions)
        const twoActions = await getViewableActionsByPoint(
            'two',
            point._id,
            point.teamTwoActions,
        )
        // setTeamTwoActions(twoActions)
        return { teamOneActions: oneActions, teamTwoActions: twoActions }
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
                activePointLoading,
                allPointsLoading,
                error,
                activePoint,
                managingTeamId,
                onSelectPoint,
            }}>
            {children}
        </GameViewContext.Provider>
    )
}

export default GameViewProvider
