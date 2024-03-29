import { DisplayUser } from '../types/user'
import Point from '../types/point'
import { TeamNumber } from '../types/team'
import { finishGame } from '../services/data/game'
import { generatePlayerStatsForPoint } from '../utils/in-game-stats'
import { getLocalActionsByPoint } from '../services/data/live-action'
import { isPullingNext } from '../utils/point'
import { parseClientAction } from '../utils/action'
import useLivePoint from '../hooks/useLivePoint'
import usePointLocal from '../hooks/usePointLocal'
import { useQuery } from 'react-query'
import { Action, LiveServerActionData } from '../types/action'
import { DebouncedFunc, debounce } from 'lodash'
import React, { createContext, useMemo } from 'react'
import {
    addPlayerStats,
    resetGame,
    selectGame,
    selectTeam,
    updateScore,
} from '../store/reducers/features/game/liveGameReducer'
import { createPoint, finishPoint } from '../services/data/point'
import {
    resetPoint,
    selectPoint,
    setPoint,
} from '../store/reducers/features/point/livePointReducer'
import { useDispatch, useSelector } from 'react-redux'

interface PointEditContextProps {
    children: React.ReactNode
}

interface PointEditContextData {
    myTeamActions: LiveServerActionData[]
    activePlayers: DisplayUser[]
    team: TeamNumber
    waiting: boolean
    game?: any
    point?: Point
    error: string
    onAction: DebouncedFunc<(action: Action) => Promise<void>>
    onUndo: DebouncedFunc<() => Promise<void>>
    onFinishPoint: () => Promise<void>
    onFinishGame: () => Promise<void>
}

export const PointEditContext = createContext<PointEditContextData>({
    myTeamActions: [],
    activePlayers: [],
    team: 'one',
    waiting: false,
    game: undefined,
    point: undefined,
    error: '',
    onAction: debounce((_action: Action) => {}),
    onUndo: debounce(() => {}),
    onFinishPoint: async () => {},
    onFinishGame: async () => {},
})

const PointEditProvider = ({ children }: PointEditContextProps) => {
    const dispatch = useDispatch()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const emitter = usePointLocal(game._id, point._id)
    const {
        actionStack,
        waitingForActionResponse,
        error,
        setActionStack,
        onAction,
        onNextPoint,
        onUndo,
    } = useLivePoint(emitter)

    const { isLoading: livePointLoading } = useQuery(
        [{ liveActionByPoint: { gameId: game._id, pointId: point._id } }],
        () => getLocalActionsByPoint(point._id),
        {
            onSuccess(data) {
                const actions = data.map(a => ({
                    ...a.action,
                    teamNumber: 'one' as TeamNumber,
                }))
                setActionStack({
                    ...actionStack.addTeamOneActions(actions),
                })
            },
        },
    )

    const teamOneActions = actionStack.getTeamOneActions()
    const teamTwoActions = actionStack.getTeamTwoActions()

    const myTeamActions = useMemo(() => {
        if (team === 'one') {
            return teamOneActions
        } else {
            return teamTwoActions
        }
    }, [teamOneActions, teamTwoActions, team])

    const activePlayers = React.useMemo(() => {
        if (team === 'one') {
            return point.teamOneActivePlayers ?? []
        } else {
            return point.teamTwoActivePlayers ?? []
        }
    }, [point, team])

    const allPointPlayers = React.useMemo(() => {
        if (team === 'one') {
            return point.teamOnePlayers ?? []
        } else {
            return point.teamTwoPlayers ?? []
        }
    }, [point, team])

    const handleAction = async (action: Action) => {
        const clientAction = parseClientAction({
            ...action.action,
        })
        onAction(clientAction)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onActionDebounced = React.useCallback(debounce(handleAction, 150), [
        point,
    ])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onUndoDebounced = React.useCallback(debounce(onUndo, 150), [])

    const onFinishPoint = async () => {
        const prevPoint = await finishPoint(point, myTeamActions, team)
        const { teamOneScore, teamTwoScore } = prevPoint

        const newPoint = await createPoint(
            isPullingNext(
                team,
                myTeamActions[myTeamActions.length - 1].actionType,
            ),
            point.pointNumber + 1,
        )

        const stats = generatePlayerStatsForPoint(
            allPointPlayers,
            myTeamActions,
        )

        dispatch(addPlayerStats({ pointId: prevPoint._id, players: stats }))
        dispatch(updateScore({ teamOneScore, teamTwoScore }))
        dispatch(setPoint(newPoint))

        onNextPoint()
    }

    const onFinishGame = async () => {
        await finishPoint(point, myTeamActions, team)
        onNextPoint()

        await finishGame()
        dispatch(resetGame())
        dispatch(resetPoint())
    }

    return (
        <PointEditContext.Provider
            value={{
                myTeamActions,
                activePlayers,
                team,
                game,
                point,
                waiting: waitingForActionResponse || livePointLoading,
                error: error ?? '',
                onFinishPoint,
                onFinishGame,
                onAction: onActionDebounced,
                onUndo: onUndoDebounced,
            }}>
            {children}
        </PointEditContext.Provider>
    )
}

export default PointEditProvider
