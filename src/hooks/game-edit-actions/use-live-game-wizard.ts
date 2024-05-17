import { ActionType } from '../../types/action'
import { LiveGameContext } from '../../context/live-game-context'
import { LiveGameWizardState } from '../../types/game'
import { PointEditContext } from '../../context/point-edit-context'
import { useMutation } from 'react-query'
import { useContext, useMemo, useState } from 'react'

export const useLiveGameWizard = () => {
    const { game, point } = useContext(LiveGameContext)
    const { selectPlayers, myTeamActions, setPlayers, nextPoint, backPoint } =
        useContext(PointEditContext)
    const [state, setState] = useState(LiveGameWizardState.SET_PLAYERS)

    const onNavigateSuccess = () => {
        if (state === LiveGameWizardState.SET_PLAYERS) {
            setState(LiveGameWizardState.LOG_ACTIONS)
        } else if (state === LiveGameWizardState.LOG_ACTIONS) {
            setState(LiveGameWizardState.SET_PLAYERS)
        }
    }

    const next = async () => {
        if (state === LiveGameWizardState.SET_PLAYERS) {
            await setPlayers()
        } else if (state === LiveGameWizardState.LOG_ACTIONS) {
            await nextPoint()
        }
    }

    const { mutateAsync: nextMutate, isLoading: nextLoading } = useMutation(
        () => next(),
        {
            onSuccess: onNavigateSuccess,
        },
    )

    const back = async () => {
        if (state === LiveGameWizardState.SET_PLAYERS) {
            await backPoint()
        }
    }

    const { mutateAsync: backMutate, isLoading: backLoading } = useMutation(
        () => back(),
        {
            onSuccess: onNavigateSuccess,
        },
    )

    const backDisabled = useMemo(() => {
        if (state === LiveGameWizardState.SET_PLAYERS) {
            return point.pointNumber === 1
        } else if (state === LiveGameWizardState.LOG_ACTIONS) {
            return myTeamActions.length > 0
        }
    }, [state, point, myTeamActions])

    const nextDisabled = useMemo(() => {
        if (state === LiveGameWizardState.SET_PLAYERS) {
            return selectPlayers.selectedPlayers.length !== game.playersPerPoint
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
    }
}
