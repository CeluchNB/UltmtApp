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

    const subscriptions: SubscriptionObject = React.useMemo(() => {
        const successfulResponse = () => {
            setWaiting(false)
            setError('')
        }
        const actionSideEffects = (data: LiveServerAction) => {
            console.log('in sideffects')
            if (
                data.actionType === ActionType.SUBSTITUTION &&
                data.teamNumber === team
            ) {
                console.log('dispatching')
                dispatch(
                    substitute({
                        playerOne: data.playerOne,
                        playerTwo: data.playerTwo,
                        team: data.teamNumber,
                    }),
                )
            }
        }

        const undoSideEffects = (data: LiveServerAction) => {
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
        }

        return {
            client: async data => {
                try {
                    console.log('got action', data)
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
                    console.log('got undo')
                    if (undoTeamNumber === team) {
                        const result = await deleteLocalAction(
                            undoTeamNumber,
                            actionNumber,
                            point._id,
                        )
                        console.log('got result', result)
                        undoSideEffects(result)
                        successfulResponse()
                        setActions(immutableFilter(actionNumber))
                    }
                } catch (e: any) {
                    setError(e?.message ?? Constants.GET_ACTION_ERROR)
                }
            },
            error: data => {
                console.log('got error')
                setError(data?.message)
            },
            point: () => {},
        }
    }, [point._id, team, dispatch])

    React.useEffect(() => {
        setWaiting(true)
        getLocalActionsByPoint(point._id)
            .then(pointActions => {
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
            return point.teamOnePlayers
        } else {
            return point.teamTwoPlayers
        }
    }, [point, team])

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
