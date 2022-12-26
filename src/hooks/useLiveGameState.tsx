import { GuestUser } from '../types/user'
import React from 'react'
import { selectPoint } from '../store/reducers/features/point/livePointReducer'
import { useSelector } from 'react-redux'
import {
    ClientAction,
    ClientActionType,
    LiveServerAction,
    SubscriptionObject,
} from '../types/action'
import {
    addAction,
    joinPoint,
    nextPoint,
    subscribe,
    undoAction,
    unsubscribe,
} from '../services/data/live-action'
import { getAction, getTeamAction } from '../utils/action'
import {
    selectGame,
    selectTeam,
} from '../store/reducers/features/game/liveGameReducer'

function immutablePush<T>(newValue: T): (current: T[]) => T[] {
    return (current: T[]): T[] => {
        return [...current, newValue]
    }
}

function immutablePop<T>(current: T[]): T[] {
    return current.slice(0, -1)
}

const useLiveGameState = () => {
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
            client: data => {
                successfulResponse()
                setActions(immutablePush(data))
            },
            undo: () => {
                successfulResponse()
                setActions(immutablePop)
            },
            error: data => {
                setError(data?.message)
            },
            point: () => {},
        }
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

    const onNextPoint = () => {
        setWaiting(true)
        nextPoint(point._id)
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
        onNextPoint,
    }
}

export default useLiveGameState
