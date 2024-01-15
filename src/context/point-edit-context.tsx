import { DisplayUser } from '../types/user'
import Point from '../types/point'
import { TeamNumber } from '../types/team'
import { finishGame } from '../services/data/game'
import { isPullingNext } from '../utils/point'
import { parseClientAction } from '../utils/action'
import usePoint from '../hooks/usePoint'
import { Action, LiveServerActionData } from '../types/action'
import { DebouncedFunc, debounce } from 'lodash'
import React, { createContext, useMemo } from 'react'
import { createPoint, finishPoint } from '../services/data/point'
import {
    resetGame,
    selectGame,
    selectTeam,
    updateScore,
} from '../store/reducers/features/game/liveGameReducer'
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
    const {
        teamOneActions,
        teamTwoActions,
        waitingForActionResponse,
        onAction,
        onNextPoint,
        onUndo,
    } = usePoint(game._id, point._id)

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

    const handleAction = async (action: Action) => {
        const clientAction = parseClientAction({ ...action.action })
        onAction(clientAction)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onActionDebounced = React.useCallback(debounce(handleAction, 150), [
        point,
    ])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onUndoDebounced = React.useCallback(debounce(onUndo, 150), [])

    const onFinishPoint = async () => {
        const prevPoint = await finishPoint(point._id)
        const { teamOneScore, teamTwoScore } = prevPoint

        const newPoint = await createPoint(
            isPullingNext(
                team,
                myTeamActions[myTeamActions.length - 1].actionType,
            ),
            point.pointNumber + 1,
        )

        dispatch(updateScore({ teamOneScore, teamTwoScore }))
        dispatch(setPoint(newPoint))
        // if (!offline) {
        // TODO: new socket implementation
        // await nextPoint(point._id)
        // socket?.emit('point:next', JSON.stringify({ pointId: point._id }))
        onNextPoint()
        // }
    }

    const onFinishGame = async () => {
        await finishPoint(point._id)
        // if (!offline) {
        // TODO: new socket implementation
        // await nextPoint(point._id)
        onNextPoint()
        // }
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
                waiting: waitingForActionResponse,
                error: '',
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
