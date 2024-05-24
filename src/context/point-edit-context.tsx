import { ActionSchema } from '../models'
import ActionStack from '../utils/action-stack'
import { DisplayUser } from '../types/user'
import { LiveGameContext } from './live-game-context'
import { parseUser } from '../utils/player'
import { useBackPoint } from '../hooks/game-edit-actions/use-back-point'
import useLivePoint from '../hooks/useLivePoint'
import { useNextPoint } from '../hooks/game-edit-actions/use-next-point'
import usePointLocal from '../hooks/usePointLocal'
import { useQuery } from './realm'
import { useSelectPlayers } from '../hooks/game-edit-actions/use-select-players'
import { useSetPlayers } from '../hooks/game-edit-actions/use-set-players'
import { Action, ActionType, LiveServerActionData } from '../types/action'
import { DebouncedFunc, debounce } from 'lodash'
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { parseAction, parseClientAction } from '../utils/action'

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
    const { point, team } = useContext(LiveGameContext)
    const actions = useQuery<ActionSchema>(
        {
            type: 'Action',
            query: collection => {
                return collection.filtered('pointId == $0', point._id)
            },
        },
        [point._id],
    )

    const [waitingForActionResponse, setWaitingForActionResponse] =
        useState(false)
    const [actionStack, setActionStack] = useState(new ActionStack())
    const emitter = usePointLocal()
    const { error, onAction, onNextPoint, onUndo } = useLivePoint(emitter, {
        onError: () => {
            setWaitingForActionResponse(false)
        },
    })

    useEffect(() => {
        // TODO: GAME-REFACTOR, can this be more efficient?
        // Can this actually be in useLivePoint?
        const stack = new ActionStack()
        stack.addTeamOneActions(
            actions
                .filter(a => a.teamNumber === 'one')
                .map(a => parseAction(a)),
        )
        stack.addTeamTwoActions(
            actions
                .filter(a => a.teamNumber === 'two')
                .map(a => parseAction(a)),
        )

        setActionStack(stack)
        setWaitingForActionResponse(false)
    }, [actions])

    const selectPlayers = useSelectPlayers()
    const { setPlayers: setPlayersMutation } = useSetPlayers(
        point._id,
        selectPlayers.selectedPlayers,
    )
    const { nextPoint: nextPointMutation } = useNextPoint(point._id)
    const { backPoint: backPointMutation } = useBackPoint(point._id)

    const teamOneActions = useMemo(() => {
        return actionStack.getTeamOneActions()
    }, [actionStack])
    const teamTwoActions = useMemo(() => {
        return actionStack.getTeamTwoActions()
    }, [actionStack])

    const myTeamActions = useMemo(() => {
        if (team === 'one') {
            return teamOneActions
        } else {
            return teamTwoActions
        }
    }, [teamOneActions, teamTwoActions, team])

    const activePlayers = React.useMemo(() => {
        if (team === 'one' && point.teamOneActivePlayers) {
            return point.teamOneActivePlayers?.map(player => parseUser(player))
        } else if (team === 'two' && point.teamTwoActivePlayers) {
            return point.teamTwoActivePlayers?.map(player => parseUser(player))
        }
        return []
    }, [point, team])

    const handleAction = async (action: Action) => {
        setWaitingForActionResponse(true)
        const clientAction = parseClientAction({
            ...action.action,
        })
        onAction(clientAction)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onActionDebounced = React.useCallback(debounce(handleAction, 150), [
        point,
    ])

    const handleUndo = async () => {
        setWaitingForActionResponse(true)
        onUndo()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onUndoDebounced = React.useCallback(debounce(handleUndo, 150), [])

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
                waiting: waitingForActionResponse,
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
