import { ActionSchema } from '../models'
import ActionStack from '../utils/action-stack'
import { LiveGameContext } from './live-game-context'
import { MutationData } from '../types/mutation'
import { parseUser } from '../utils/player'
import { sortAlphabetically } from '../utils/stats'
import { useBackPoint } from '../hooks/game-edit-actions/use-back-point'
import useLivePoint from '../hooks/useLivePoint'
import { useNextPoint } from '../hooks/game-edit-actions/use-next-point'
import usePointLocal from '../hooks/usePointLocal'
import { useQuery } from './realm'
import { useSelectPlayers } from '../hooks/game-edit-actions/use-select-players'
import { useSetPlayers } from '../hooks/game-edit-actions/use-set-players'
import { useSwitchPullingTeam } from '../hooks/game-edit-actions/use-switch-pulling-team'
import { Action, ActionType, LiveServerActionData } from '../types/action'
import { DebouncedFunc, debounce } from 'lodash'
import { DisplayUser, InGameStatsUser } from '../types/user'
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
    setPlayers: MutationData
    nextPoint: MutationData
    backPoint: MutationData
    selectPlayers: Omit<ReturnType<typeof useSelectPlayers>, 'clearSelection'>
    pullingMismatchConfirmVisible: boolean
    setPullingMismatchConfirmVisible: (value: boolean) => void
    switchPullingTeam: () => Promise<void>
}

export const PointEditContext = createContext<PointEditContextData>(
    {} as PointEditContextData,
)

const PointEditProvider = ({ children }: PointEditContextProps) => {
    const {
        point,
        team,
        finishGameMutation: { finishGameReset },
    } = useContext(LiveGameContext)
    const actions = useQuery<ActionSchema>(
        {
            type: 'Action',
            query: collection => {
                return collection.filtered('pointId == $0', point?._id)
            },
        },
        [point?._id],
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

    const [pullingMismatchConfirmVisible, setPullingMismatchConfirmVisible] =
        useState(false)

    useEffect(() => {
        // TODO: GAME-REFACTOR, can this be more efficient?
        // Can this actually be in useLivePoint?
        // Action stack needs to be a useMemo or just calculated
        // waiting needs to be in useLivePoint
        // Test going back after this is done
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
    const {
        mutateAsync: setPlayersMutation,
        isLoading: setPlayersLoading,
        error: setPlayersError,
        reset: setPlayersReset,
    } = useSetPlayers(
        point?._id ?? '',
        selectPlayers.selectedPlayers.sort((a, b) =>
            sortAlphabetically(
                `${a.firstName} ${a.lastName}`,
                `${b.firstName} ${b.lastName}`,
            ),
        ),
        () => setPullingMismatchConfirmVisible(true),
    )
    const { mutateAsync: switchPullingTeam } = useSwitchPullingTeam()

    const {
        mutateAsync: nextPointMutation,
        isLoading: nextPointLoading,
        error: nextPointError,
        reset: nextPointReset,
    } = useNextPoint(point?._id ?? '')
    const {
        mutateAsync: backPointMutation,
        isLoading: backPointLoading,
        error: backPointError,
        reset: backPointReset,
    } = useBackPoint(point?._id ?? '')

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
        if (team === 'one' && point?.teamOneActivePlayers) {
            return point.teamOneActivePlayers?.map(player => parseUser(player))
        } else if (team === 'two' && point?.teamTwoActivePlayers) {
            return point.teamTwoActivePlayers?.map(player => parseUser(player))
        }
        return []
    }, [point, team])

    const handleAction = async (action: Action) => {
        resetMutations()
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
        resetMutations()
        setWaitingForActionResponse(true)
        onUndo()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onUndoDebounced = React.useCallback(debounce(handleUndo, 150), [])

    const setPlayers = async () => {
        resetMutations()
        await setPlayersMutation()
        selectPlayers.clearSelection()
    }

    const nextPoint = async () => {
        resetMutations()
        const lastAction = myTeamActions[myTeamActions.length - 1].actionType
        await nextPointMutation(
            lastAction === ActionType.TEAM_ONE_SCORE ? 'one' : 'two',
        )
        onNextPoint()
    }

    const backPoint = async () => {
        resetMutations()
        await backPointMutation()
    }

    const togglePlayerSelection = (player: InGameStatsUser) => {
        resetMutations()
        selectPlayers.toggleSelection(player)
    }

    const resetMutations = () => {
        setPlayersReset()
        nextPointReset()
        backPointReset()
        finishGameReset()
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
                setPlayers: {
                    mutate: setPlayers,
                    error: setPlayersError?.message,
                    isLoading: setPlayersLoading,
                },
                nextPoint: {
                    mutate: nextPoint,
                    error: nextPointError?.message,
                    isLoading: nextPointLoading,
                },
                backPoint: {
                    mutate: backPoint,
                    error: backPointError?.message,
                    isLoading: backPointLoading,
                },
                selectPlayers: {
                    selectedPlayers: selectPlayers.selectedPlayers,
                    toggleSelection: togglePlayerSelection,
                },
                pullingMismatchConfirmVisible,
                setPullingMismatchConfirmVisible,
                switchPullingTeam: switchPullingTeam,
            }}>
            {children}
        </PointEditContext.Provider>
    )
}

export default PointEditProvider
