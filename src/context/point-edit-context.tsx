import ActionStack from '../utils/action-stack'
import { DisplayUser } from '../types/user'
import { LiveGameContext } from './live-game-context'
import { PointSchema } from '../models'
import { TeamNumber } from '../types/team'
import { finishGame } from '../services/data/game'
import { generatePlayerStatsForPoint } from '../utils/in-game-stats'
import { getLocalActionsByPoint } from '../services/data/live-action'
import { isPullingNext } from '../utils/point'
import { parseClientAction } from '../utils/action'
import { useDispatch } from 'react-redux'
import useLivePoint from '../hooks/useLivePoint'
import usePointLocal from '../hooks/usePointLocal'
import { useQuery } from 'react-query'
import { useSelectPlayers } from '../hooks/game-edit-actions/use-select-players'
import { useSetPlayers } from '../hooks/game-edit-actions/use-set-players'
import { Action, LiveServerActionData } from '../types/action'
import { DebouncedFunc, debounce } from 'lodash'
import React, { createContext, useContext, useMemo } from 'react'
import {
    addPlayerStats,
    resetGame,
    updateScore,
} from '../store/reducers/features/game/liveGameReducer'
import { createPoint, finishPoint } from '../services/data/point'
import {
    resetPoint,
    setPoint,
} from '../store/reducers/features/point/livePointReducer'

interface PointEditContextProps {
    children: React.ReactNode
}

interface PointEditContextData {
    myTeamActions: LiveServerActionData[]
    activePlayers: DisplayUser[]
    team: TeamNumber
    waiting: boolean
    game?: any
    point?: PointSchema
    error: string
    onAction: DebouncedFunc<(action: Action) => Promise<void>>
    onUndo: DebouncedFunc<() => Promise<void>>
    onFinishPoint: () => Promise<void>
    onFinishGame: () => Promise<void>
    setPlayers: () => Promise<void>
    selectPlayers: ReturnType<typeof useSelectPlayers>
}

export const PointEditContext = createContext<PointEditContextData>({
    // myTeamActions: [],
    // activePlayers: [],
    // team: 'one',
    // waiting: false,
    // game: undefined,
    // point: undefined,
    // error: '',
    // onAction: debounce((_action: Action) => {}),
    // onUndo: debounce(() => {}),
    // onFinishPoint: async () => {},
    // onFinishGame: async () => {},
    // setPlayers: async () => {},
} as PointEditContextData)

const PointEditProvider = ({ children }: PointEditContextProps) => {
    const { game, point, teamNumber } = useContext(LiveGameContext)
    const dispatch = useDispatch()
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

    const selectPlayers = useSelectPlayers()
    const { setPlayers } = useSetPlayers(
        point._id,
        selectPlayers.selectedPlayers,
    )

    // TODO: GAME-REFACTOR refactor to using realm useQuery
    const { isLoading: livePointLoading } = useQuery(
        [{ liveActionByPoint: { gameId: game._id, pointId: point._id } }],
        () => getLocalActionsByPoint(point._id),
        {
            onSuccess(data) {
                const stack = new ActionStack()
                stack.addTeamOneActions(
                    data.filter(a => a.teamNumber === 'one'),
                )
                stack.addTeamTwoActions(
                    data.filter(a => a.teamNumber === 'two'),
                )
                setActionStack(stack)
            },
        },
    )

    const teamOneActions = actionStack.getTeamOneActions()
    const teamTwoActions = actionStack.getTeamTwoActions()

    const myTeamActions = useMemo(() => {
        if (teamNumber === 'one') {
            return teamOneActions
        } else {
            return teamTwoActions
        }
    }, [teamOneActions, teamTwoActions, teamNumber])

    const activePlayers = React.useMemo(() => {
        if (teamNumber === 'one') {
            return point.teamOneActivePlayers ?? []
        } else {
            return point.teamTwoActivePlayers ?? []
        }
    }, [point, teamNumber])

    const allPointPlayers = React.useMemo(() => {
        if (teamNumber === 'one') {
            return point.teamOnePlayers ?? []
        } else {
            return point.teamTwoPlayers ?? []
        }
    }, [point, teamNumber])

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
        const prevPoint = await finishPoint(point, myTeamActions, teamNumber)
        const { teamOneScore, teamTwoScore } = prevPoint

        const newPoint = await createPoint(
            isPullingNext(
                teamNumber,
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
        await finishPoint(point, myTeamActions, teamNumber)
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
                team: teamNumber,
                game,
                point,
                waiting: waitingForActionResponse || livePointLoading,
                error: error ?? '',
                onFinishPoint,
                onFinishGame,
                onAction: onActionDebounced,
                onUndo: onUndoDebounced,
                setPlayers,
                selectPlayers,
            }}>
            {children}
        </PointEditContext.Provider>
    )
}

export default PointEditProvider
