import { ActionType } from '../../types/action'
import { LiveGameContext } from '../../context/live-game-context'
import { LiveGameWizardState } from '../../types/game'
import { PointEditContext } from '../../context/point-edit-context'
import { useMutation } from 'react-query'
import { useContext, useMemo, useState } from 'react'

export const useLiveGameWizard = (
    initialState: LiveGameWizardState = LiveGameWizardState.SET_PLAYERS,
) => {
    const { game, point } = useContext(LiveGameContext)
    const { selectPlayers, myTeamActions, setPlayers, nextPoint, backPoint } =
        useContext(PointEditContext)
    const [state, setState] = useState(initialState)

    const navigate = () => {
        if (state === LiveGameWizardState.SET_PLAYERS) {
            setState(LiveGameWizardState.LOG_ACTIONS)
        } else if (state === LiveGameWizardState.LOG_ACTIONS) {
            setState(LiveGameWizardState.SET_PLAYERS)
        }
    }

    const next = async () => {
        try {
            if (state === LiveGameWizardState.SET_PLAYERS) {
                await setPlayers.mutate()
            } else if (state === LiveGameWizardState.LOG_ACTIONS) {
                await nextPoint.mutate()
            }
            navigate()
        } catch {}
    }

    const { mutateAsync: nextMutate, isLoading: nextLoading } = useMutation(
        () => next(),
    )

    const back = async () => {
        try {
            if (state === LiveGameWizardState.SET_PLAYERS) {
                await backPoint.mutate()
            }
            navigate()
        } catch {}
    }

    const { mutateAsync: backMutate, isLoading: backLoading } = useMutation(
        () => back(),
    )

    const backDisabled = useMemo(() => {
        if (state === LiveGameWizardState.SET_PLAYERS) {
            return point?.pointNumber === 1
        } else if (state === LiveGameWizardState.LOG_ACTIONS) {
            return myTeamActions.length > 0
        }
    }, [state, point, myTeamActions])

    const nextDisabled = useMemo(() => {
        if (state === LiveGameWizardState.SET_PLAYERS) {
            const selectedPlayers = Object.values(
                selectPlayers.playerOptions,
            ).filter(p => p.selected)
            return selectedPlayers.length !== game?.playersPerPoint
        } else if (state === LiveGameWizardState.LOG_ACTIONS) {
            const lastAction = myTeamActions[myTeamActions.length - 1]
            return (
                !lastAction ||
                ![
                    ActionType.TEAM_ONE_SCORE,
                    ActionType.TEAM_TWO_SCORE,
                ].includes(lastAction.actionType)
            )
        }
    }, [state, selectPlayers, game, myTeamActions])

    return {
        state,
        backDisabled,
        nextDisabled,
        backLoading,
        nextLoading,
        next: nextMutate,
        back: backMutate,
        navigate: navigate,
    }
}
