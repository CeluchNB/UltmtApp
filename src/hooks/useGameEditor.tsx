import * as Constants from '../utils/constants'
import Point from '../types/point'
import React from 'react'
import { UpdateGame } from '../types/game'
import { debounce } from 'lodash'
import { finishGame } from '../services/data/game'
import { isPullingNext } from '../utils/point'
import {
    Action,
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

    const successfulResponse = React.useCallback(
        (updatedPoint: Point) => {
            dispatch(setPoint(updatedPoint))
            setWaiting(false)
            setError('')
        },
        [dispatch, setWaiting, setError],
    )

    const subscriptions: SubscriptionObject = React.useMemo(() => {
        return {
            client: async (data: LiveServerActionData) => {
                try {
                    const { action, point: updatedPoint } =
                        await saveLocalAction(data, point._id)

                    successfulResponse(updatedPoint)
                    setActions(immutablePush(action))
                } catch (e: any) {
                    setError(e?.message ?? Constants.GET_ACTION_ERROR)
                }
            },
            undo: async ({ team: undoTeamNumber, actionNumber }) => {
                try {
                    if (undoTeamNumber === team) {
                        const { action, point: updatedPoint } =
                            await deleteLocalAction(
                                undoTeamNumber,
                                actionNumber,
                                point._id,
                            )
                        successfulResponse(updatedPoint)
                        setActions(immutableFilter(action.actionNumber))
                    }
                } catch (e: any) {
                    setError(e?.message ?? Constants.GET_ACTION_ERROR)
                }
            },
            error: data => {
                setWaiting(false)
                setError(data?.message)
            },
            point: () => {},
        }
    }, [point._id, team, successfulResponse])

    React.useEffect(() => {
        setWaiting(true)
        activeGameOffline().then(isOffline => {
            setOffline(isOffline)
        })
        // TODO: is this needed?
        getLocalActionsByPoint(point._id)
            .then(pointActions => {
                setActions(curr => [...curr, ...pointActions])
            })
            .catch(_e => {})
            .finally(() => {
                setWaiting(false)
            })
    }, [point])

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
            return point.teamOneActivePlayers ?? []
        } else {
            return point.teamTwoActivePlayers ?? []
        }
    }, [point, team])

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

    const handleAction = async (action: Action) => {
        setWaiting(true)
        if (offline) {
            const { action: newAction, point: updatedPoint } =
                await createOfflineAction(action, point._id)
            successfulResponse(updatedPoint)
            setActions(immutablePush(newAction))
        } else {
            addAction(action, point._id)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onAction = React.useCallback(debounce(handleAction, 150), [
        offline,
        point,
    ])

    const handleUndo = async () => {
        setWaiting(true)
        if (offline) {
            const { action, point: updatedPoint } = await undoOfflineAction(
                point._id,
            )
            successfulResponse(updatedPoint)
            setActions(immutableFilter(action.actionNumber))
        } else {
            undoAction(point._id)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onUndo = React.useCallback(debounce(handleUndo, 150), [
        offline,
        point,
    ])

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
        } catch (e) {
            // TODO: error display?
        }
    }

    const onEditGame = async (gameData: UpdateGame) => {
        try {
            const data = parseUpdateGame(gameData)
            const result = await editGame(game._id, data)
            dispatch(setGame(result))
        } catch (e) {
            throw e // TODO: error display?
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
