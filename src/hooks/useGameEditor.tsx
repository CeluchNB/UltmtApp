import * as Constants from '../utils/constants'
import { DisplayUser } from '../types/user'
import React from 'react'
import { finishGame } from '../services/data/game'
import { isPullingNext } from '../utils/point'
import {
    ActionType,
    ClientAction,
    ClientActionType,
    LiveServerAction,
    SubscriptionObject,
} from '../types/action'
import {
    addAction,
    deleteLocalAction,
    getLocalActionsByPoint,
    joinPoint,
    nextPoint,
    saveLocalAction,
    subscribe,
    undoAction,
    unsubscribe,
} from '../services/data/live-action'
import { createPoint, finishPoint } from '../services/data/point'
import { getAction, getTeamAction } from '../utils/action'
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
    substitute,
} from '../store/reducers/features/point/livePointReducer'
import { useDispatch, useSelector } from 'react-redux'

function immutablePush<T>(newValue: T): (current: T[]) => T[] {
    return (current: T[]): T[] => {
        return [...current, newValue]
    }
}

function immutableFilter<T extends { actionNumber: number }>(
    actionNumber: number,
): (current: T[]) => T[] {
    return (current: T[]): T[] => {
        return current.filter(item => item.actionNumber !== actionNumber)
    }
}

export const useGameEditor = () => {
    const dispatch = useDispatch()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const [waiting, setWaiting] = React.useState(false)
    const [error, setError] = React.useState('')
    const [actions, setActions] = React.useState<LiveServerAction[]>([])

    const actionSideEffects = React.useCallback(
        (data: LiveServerAction) => {
            if (
                data.actionType === ActionType.SUBSTITUTION &&
                data.teamNumber === team
            ) {
                dispatch(
                    substitute({
                        playerOne: data.playerOne,
                        playerTwo: data.playerTwo,
                        team: data.teamNumber,
                    }),
                )
            }
        },
        [team, dispatch],
    )

    const undoSideEffects = React.useCallback(
        (data: LiveServerAction) => {
            if (
                data.actionType === ActionType.SUBSTITUTION &&
                data.teamNumber === team
            ) {
                dispatch(
                    substitute({
                        playerOne: data.playerTwo,
                        playerTwo: data.playerOne,
                        team: data.teamNumber,
                    }),
                )
            }
        },
        [team, dispatch],
    )

    const subscriptions: SubscriptionObject = React.useMemo(() => {
        const successfulResponse = () => {
            setWaiting(false)
            setError('')
        }

        return {
            client: async data => {
                try {
                    const action = await saveLocalAction(data, point._id)
                    actionSideEffects(data)
                    successfulResponse()
                    setActions(immutablePush(action))
                } catch (e: any) {
                    setError(e?.message ?? Constants.GET_ACTION_ERROR)
                }
            },
            undo: async ({ team: undoTeamNumber, actionNumber }) => {
                try {
                    if (undoTeamNumber === team) {
                        const result = await deleteLocalAction(
                            undoTeamNumber,
                            actionNumber,
                            point._id,
                        )
                        undoSideEffects(result)
                        successfulResponse()
                        setActions(immutableFilter(actionNumber))
                    }
                } catch (e: any) {
                    setError(e?.message ?? Constants.GET_ACTION_ERROR)
                }
            },
            error: data => {
                setError(data?.message)
            },
            point: () => {},
        }
    }, [point._id, team, actionSideEffects, undoSideEffects])

    React.useEffect(() => {
        setWaiting(true)
        getLocalActionsByPoint(point._id)
            .then(pointActions => {
                for (const action of pointActions) {
                    actionSideEffects(action)
                }
                setActions(curr => [...curr, ...pointActions])
            })
            .catch(_e => {})
            .finally(() => {
                setWaiting(false)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        setWaiting(true)
        joinPoint(game._id, point._id)
            .then(() => {
                return subscribe(subscriptions)
            })
            .then(() => {
                setWaiting(false)
            })
        return () => {
            unsubscribe()
        }
    }, [game, point, subscriptions])

    const activePlayers = React.useMemo(() => {
        if (team === 'one') {
            return point.teamOnePlayers.slice(0, game.playersPerPoint)
        } else {
            return point.teamTwoPlayers.slice(0, game.playersPerPoint)
        }
    }, [point, team, game])

    const lastAction = React.useMemo(() => {
        for (let i = actions.length - 1; i >= 0; i--) {
            // don't worry about other team's actions
            if (actions[i].teamNumber === team) {
                return actions[i]
            }
        }
        return undefined
    }, [actions, team])

    const myTeamActions = React.useMemo(() => {
        return actions.filter(a => a.teamNumber === team)
    }, [actions, team])

    const onAction = (action: ClientAction) => {
        setWaiting(true)
        addAction(action, point._id)
    }

    const onPlayerAction = (
        actionType: ClientActionType,
        tags: string[],
        playerOne: DisplayUser,
    ) => {
        let playerTwo
        if (actions.length > 0) {
            playerTwo = actions[actions.length - 1].playerOne
        }
        const action = getAction(actionType, team, tags, playerOne, playerTwo)
        onAction(action)
    }

    const onTeamAction = (
        actionType: ClientActionType,
        tags: string[],
        playerOne?: DisplayUser,
        playerTwo?: DisplayUser,
    ) => {
        const action = getTeamAction(
            actionType,
            team,
            tags,
            playerOne,
            playerTwo,
        )
        addAction(action, point._id)
    }

    const onUndo = () => {
        setWaiting(true)
        undoAction(point._id)
    }

    const onFinishPoint = async () => {
        const prevPoint = await finishPoint(point._id)
        const { teamOneScore, teamTwoScore } = prevPoint

        const newPoint = await createPoint(
            isPullingNext(team, lastAction?.actionType),
            point.pointNumber + 1,
        )

        dispatch(updateScore({ teamOneScore, teamTwoScore }))
        dispatch(setPoint(newPoint))
        await nextPoint(point._id)
    }

    const onFinishGame = async () => {
        await finishPoint(point._id)
        await finishGame()
        dispatch(resetGame())
        dispatch(resetPoint())
    }

    return {
        activePlayers,
        actions,
        myTeamActions,
        error,
        game,
        lastAction,
        point,
        team,
        waiting,
        onPlayerAction,
        onTeamAction,
        onUndo,
        onFinishPoint,
        onFinishGame,
    }
}
