import { ActionSchema } from '../models'
import ActionStack from '../utils/action-stack'
import { DisplayUser } from '../types/user'
import { LiveGameContext } from './live-game-context'
import { MutationData } from '../types/mutation'
import { parseUser } from '../utils/player'
import { sortAlphabetically } from '../utils/stats'
import { useBackPoint } from '../hooks/game-edit-actions/use-back-point'
import useLivePoint from '../hooks/useLivePoint'
import { useNextPoint } from '../hooks/game-edit-actions/use-next-point'
import usePointLocal from '../hooks/usePointLocal'
import { useRealm } from './realm'
import { useSelectPlayers } from '../hooks/game-edit-actions/use-select-players'
import { useSetPlayers } from '../hooks/game-edit-actions/use-set-players'
import { useSwitchPullingTeam } from '../hooks/game-edit-actions/use-switch-pulling-team'
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

export interface PointEditContextData {
    myTeamActions: LiveServerActionData[]
    activePlayers: DisplayUser[]
    waiting: boolean
    error: string
    onAction: DebouncedFunc<(action: Action) => Promise<void>>
    onUndo: DebouncedFunc<() => Promise<void>>
    setPlayers: MutationData
    nextPoint: MutationData
    backPoint: MutationData
    selectPlayers: ReturnType<typeof useSelectPlayers>
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
        players,
        finishGameMutation: { reset: finishGameReset },
    } = useContext(LiveGameContext)
    const realm = useRealm()

    const emitter = usePointLocal()
    const {
        error,
        actionStack,
        waiting,
        setActionStack,
        onAction,
        onNextPoint,
        onUndo,
    } = useLivePoint(emitter)

    const [pullingMismatchConfirmVisible, setPullingMismatchConfirmVisible] =
        useState(false)

    useEffect(() => {
        // this only runs on initialize for re-enter point functionality
        const actions = realm
            .objects<ActionSchema>('Action')
            .filtered('pointId == $0', point?._id)
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
    }, [realm, point, setActionStack])

    const selectPlayers = useSelectPlayers(point?.gameId ?? '', players ?? [])
    const {
        mutateAsync: setPlayersMutation,
        isLoading: setPlayersLoading,
        error: setPlayersError,
        reset: setPlayersReset,
    } = useSetPlayers(point?._id ?? '', () =>
        setPullingMismatchConfirmVisible(true),
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
        onUndo()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onUndoDebounced = React.useCallback(debounce(handleUndo, 150), [])

    const setPlayers = async () => {
        resetMutations()
        const selectedPlayers = Object.values(selectPlayers.playerOptions)
            .filter(p => p.selected)
            .map(p => p.player)
            .sort((a, b) =>
                sortAlphabetically(
                    `${a.firstName} ${a.lastName}`,
                    `${b.firstName} ${b.lastName}`,
                ),
            )
        await setPlayersMutation(selectedPlayers)
        selectPlayers.clearSelection()
        selectPlayers.refreshLines()
    }

    const nextPoint = async () => {
        resetMutations()
        const lastAction = myTeamActions[myTeamActions.length - 1].actionType
        await nextPointMutation({
            pullingTeam:
                lastAction === ActionType.TEAM_ONE_SCORE ? 'one' : 'two',
            emitNextPoint: onNextPoint,
        })
    }

    const backPoint = async () => {
        resetMutations()
        await backPointMutation()
    }

    const togglePlayerSelection = (player: DisplayUser) => {
        resetMutations()
        selectPlayers.toggleSelection(player)
    }

    const clearPlayerSelection = () => {
        resetMutations()
        selectPlayers.clearSelection()
    }

    const togglePlayerLine = (lineId: string) => {
        resetMutations()
        selectPlayers.toggleLine(lineId)
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
                waiting,
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
                    lineOptions: selectPlayers.lineOptions,
                    playerOptions: selectPlayers.playerOptions,
                    toggleLine: togglePlayerLine,
                    toggleSelection: togglePlayerSelection,
                    clearSelection: clearPlayerSelection,
                    refreshLines: selectPlayers.refreshLines,
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
