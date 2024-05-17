import ActionStack from '../utils/action-stack'
import { DisplayUser } from '../types/user'
import { LiveGameContext } from './live-game-context'
import { getLocalActionsByPoint } from '../services/data/live-action'
import { parseClientAction } from '../utils/action'
import { useBackPoint } from '../hooks/game-edit-actions/use-back-point'
import useLivePoint from '../hooks/useLivePoint'
import { useNextPoint } from '../hooks/game-edit-actions/use-next-point'
import usePointLocal from '../hooks/usePointLocal'
import { useQuery } from 'react-query'
import { useSelectPlayers } from '../hooks/game-edit-actions/use-select-players'
import { useSetPlayers } from '../hooks/game-edit-actions/use-set-players'
import { Action, ActionType, LiveServerActionData } from '../types/action'
import { DebouncedFunc, debounce } from 'lodash'
import React, { createContext, useContext, useMemo } from 'react'

interface PointEditContextProps {
    children: React.ReactNode
}

interface PointEditContextData {
    myTeamActions: LiveServerActionData[]
    activePlayers: DisplayUser[]
    waiting: boolean
    error: string
    onAction: DebouncedFunc<(action: Action) => Promise<void>>
    onUndo: DebouncedFunc<() => Promise<void>>
    setPlayers: () => Promise<void>
    nextPoint: () => Promise<void>
    backPoint: () => Promise<void>
    selectPlayers: ReturnType<typeof useSelectPlayers>
}

export const PointEditContext = createContext<PointEditContextData>(
    {} as PointEditContextData,
)

const PointEditProvider = ({ children }: PointEditContextProps) => {
    const { game, point, team } = useContext(LiveGameContext)

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
    const { setPlayers: setPlayersMutation } = useSetPlayers(
        point._id,
        selectPlayers.selectedPlayers,
    )
    const { nextPoint: nextPointMutation } = useNextPoint(point._id)
    const { backPoint: backPointMutation } = useBackPoint(point._id)

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

    // TODO: GAME-REFACTOR needed for substitution?
    // const allPointPlayers = React.useMemo(() => {
    //     if (team === 'one') {
    //         return point.teamOnePlayers ?? []
    //     } else {
    //         return point.teamTwoPlayers ?? []
    //     }
    // }, [point, team])

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

    // TODO: GAME-REFACTOR - ensure all logic here is covered after refactor
    // const onFinishPoint = async () => {
    //     const prevPoint = await finishPoint(point, myTeamActions, team)
    //     const { teamOneScore, teamTwoScore } = prevPoint

    //     const newPoint = await createPoint(
    //         isPullingNext(
    //             team,
    //             myTeamActions[myTeamActions.length - 1].actionType,
    //         ),
    //         point.pointNumber + 1,
    //     )

    //     const stats = generatePlayerStatsForPoint(
    //         allPointPlayers,
    //         myTeamActions,
    //     )

    //     dispatch(addPlayerStats({ pointId: prevPoint._id, players: stats }))
    //     dispatch(updateScore({ teamOneScore, teamTwoScore }))
    //     dispatch(setPoint(newPoint))

    //     onNextPoint()
    // }

    // const onFinishGame = async () => {
    //     await finishPoint(point, myTeamActions, teamNumber)
    //     onNextPoint()

    //     await finishGame()
    //     dispatch(resetGame())
    //     dispatch(resetPoint())
    // }

    const setPlayers = async () => {
        await setPlayersMutation()
        selectPlayers.clearSelection()
    }

    const nextPoint = async () => {
        const lastAction = myTeamActions[myTeamActions.length - 1].actionType
        await nextPointMutation(
            lastAction === ActionType.TEAM_ONE_SCORE ? 'one' : 'two',
        )
        onNextPoint()
    }

    const backPoint = async () => {
        await backPointMutation()
    }

    return (
        <PointEditContext.Provider
            value={{
                myTeamActions,
                activePlayers,
                waiting: waitingForActionResponse || livePointLoading,
                error: error ?? '',
                onAction: onActionDebounced,
                onUndo: onUndoDebounced,
                setPlayers,
                nextPoint,
                backPoint,
                selectPlayers,
            }}>
            {children}
        </PointEditContext.Provider>
    )
}

export default PointEditProvider
