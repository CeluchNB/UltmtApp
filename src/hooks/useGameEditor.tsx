import { GuestUser } from '../types/user'
import React from 'react'
import { finishGame } from '../services/data/game'
import { isPullingNext } from '../utils/point'
import {
    ClientAction,
    ClientActionType,
    LiveServerAction,
    SubscriptionObject,
} from '../types/action'
import {
    addAction,
    deleteLocalAction,
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
    selectGame,
    selectTeam,
    updateScore,
} from '../store/reducers/features/game/liveGameReducer'
import {
    selectPoint,
    setPoint,
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
        return {
            client: async data => {
                await saveLocalAction(data, point._id)
                successfulResponse()
                setActions(immutablePush(data))
            },
            undo: async ({ team: undoTeamNumber, actionNumber }) => {
                if (undoTeamNumber === team) {
                    await deleteLocalAction(
                        undoTeamNumber,
                        actionNumber,
                        point._id,
                    )
                    successfulResponse()
                    setActions(immutableFilter(actionNumber))
                }
            },
            error: data => {
                setError(data?.message)
            },
            point: () => {},
        }
    }, [point._id, team])

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
        playerOne: GuestUser,
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
        playerOne?: GuestUser,
        playerTwo?: GuestUser,
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
