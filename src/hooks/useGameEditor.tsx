import * as Constants from '../utils/constants'
import React from 'react'
import { UpdateGame } from '../types/game'
import { finishGame } from '../services/data/game'
import { isPullingNext } from '../utils/point'
import {
    Action,
    ActionType,
    LiveServerActionData,
    SubscriptionObject,
} from '../types/action'
import { activeGameOffline, editGame } from '../services/data/game'
import {
    addAction,
    createOfflineAction,
    deleteLocalAction,
    getLocalActionsByPoint,
    joinPoint,
    nextPoint,
    saveLocalAction,
    subscribe,
    undoAction,
    undoOfflineAction,
    unsubscribe,
} from '../services/data/live-action'
import { createPoint, finishPoint } from '../services/data/point'
import {
    resetGame,
    selectGame,
    selectTeam,
    setGame,
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

function immutableFilter<T extends { action: { actionNumber: number } }>(
    actionNumber: number,
): (current: T[]) => T[] {
    return (current: T[]): T[] => {
        return current.filter(item => item.action.actionNumber !== actionNumber)
    }
}

export const useGameEditor = () => {
    const dispatch = useDispatch()
    const game = useSelector(selectGame)
    const team = useSelector(selectTeam)
    const point = useSelector(selectPoint)
    const [waiting, setWaiting] = React.useState(false)
    const [error, setError] = React.useState('')
    const [actions, setActions] = React.useState<Action[]>([])
    const [offline, setOffline] = React.useState(false)

    const actionSideEffects = React.useCallback(
        (data: Action) => {
            const action = data.action as LiveServerActionData
            if (
                action.actionType === ActionType.SUBSTITUTION &&
                action.teamNumber === team
            ) {
                dispatch(
                    substitute({
                        playerOne: data.action.playerOne,
                        playerTwo: data.action.playerTwo,
                        team: action.teamNumber,
                    }),
                )
            }
        },
        [team, dispatch],
    )

    const undoSideEffects = React.useCallback(
        (data: LiveServerActionData) => {
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

    const successfulResponse = () => {
        setWaiting(false)
        setError('')
    }

    const subscriptions: SubscriptionObject = React.useMemo(() => {
        return {
            client: async (data: LiveServerActionData) => {
                try {
                    const action = await saveLocalAction(data, point._id)
                    actionSideEffects(action)
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
        activeGameOffline().then(isOffline => {
            setOffline(isOffline)
        })
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
            .finally(() => {
                setWaiting(false)
                setError('')
            })
        return () => {
            unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
            if (
                (actions[i].action as LiveServerActionData).teamNumber === team
            ) {
                return actions[i]
            }
        }
        return undefined
    }, [actions, team])

    const myTeamActions = React.useMemo(() => {
        return actions.filter(
            a => (a.action as LiveServerActionData).teamNumber === team,
        )
    }, [actions, team])

    const onAction = async (action: Action) => {
        setWaiting(true)
        if (offline) {
            const newAction = await createOfflineAction(action, point._id)
            actionSideEffects(newAction)
            successfulResponse()
            setActions(immutablePush(newAction))
        } else {
            addAction(action, point._id)
        }
    }

    const onUndo = async () => {
        setWaiting(true)
        if (offline) {
            const result = await undoOfflineAction(point._id)
            undoSideEffects(result)
            successfulResponse()
            setActions(immutableFilter(result.actionNumber))
        } else {
            undoAction(point._id)
        }
    }

    const onFinishPoint = async () => {
        const prevPoint = await finishPoint(point._id)
        const { teamOneScore, teamTwoScore } = prevPoint

        const newPoint = await createPoint(
            isPullingNext(team, lastAction?.action.actionType),
            point.pointNumber + 1,
        )

        dispatch(updateScore({ teamOneScore, teamTwoScore }))
        dispatch(setPoint(newPoint))
        if (!offline) {
            await nextPoint(point._id)
        }
    }

    const onFinishGame = async () => {
        try {
            await finishPoint(point._id)
            if (!offline) {
                await nextPoint(point._id)
            }
            await finishGame()
            dispatch(resetGame())
            dispatch(resetPoint())
        } catch (e) {}
    }

    const onEditGame = async (gameData: UpdateGame) => {
        try {
            const data = parseUpdateGame(gameData)
            const result = await editGame(game._id, data)
            dispatch(setGame(result))
        } catch (e) {
            throw e
        }
    }

    const parseUpdateGame = (data: UpdateGame): UpdateGame => {
        return {
            scoreLimit: Number(data.scoreLimit),
            halfScore: Number(data.halfScore),
            startTime: data.startTime,
            softcapMins: Number(data.softcapMins),
            hardcapMins: Number(data.hardcapMins),
            playersPerPoint: Number(data.playersPerPoint),
            timeoutPerHalf: Number(data.timeoutPerHalf),
            floaterTimeout: data.floaterTimeout,
        }
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
        onAction,
        onUndo,
        onFinishPoint,
        onFinishGame,
        onEditGame,
    }
}
