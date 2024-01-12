import * as Constants from '../utils/constants'
import Point from '../types/point'
import React from 'react'
import { Socket } from 'socket.io-client'
import { UpdateGame } from '../types/game'
import { debounce } from 'lodash'
import { finishGame } from '../services/data/game'
import { isPullingNext } from '../utils/point'
import { parseUpdateGame } from '../utils/game'
import {
    Action,
    LiveServerActionData,
    SubscriptionObject,
} from '../types/action'
import { activeGameOffline, editGame } from '../services/data/game'
import {
    createOfflineAction,
    deleteLocalAction,
    getLocalActionsByPoint,
    saveLocalAction,
    undoOfflineAction,
} from '../services/data/live-action'
import { createPoint, finishPoint } from '../services/data/point'
import {
    immutableActionAddition,
    immutableFilter,
    parseClientAction,
} from '../utils/action'
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

export const useGameEditor = (socket?: Socket) => {
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

    const subscriptions: SubscriptionObject = {
        client: async (data: LiveServerActionData) => {
            try {
                const { action, point: updatedPoint } = await saveLocalAction(
                    data,
                    point._id,
                )
                successfulResponse(updatedPoint)
                setActions(immutableActionAddition(action))
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

    React.useEffect(() => {
        setWaiting(true)
        activeGameOffline().then(isOffline => {
            setOffline(isOffline)
        })

        getLocalActionsByPoint(point._id)
            .then(pointActions => {
                setActions(pointActions)
            })
            .catch(_e => {})
            .finally(() => {
                setWaiting(false)
            })
    }, [point._id])

    React.useEffect(() => {
        setWaiting(true)
        if (!socket) {
            setWaiting(false)
            setError('')
            return
        }

        // TODO: new socket implementation
        socket.io.on('open', () => {
            socket.removeAllListeners()
            socket.emit('join:point', game._id, point._id)
            socket.on('action:client', subscriptions.client)
            socket.on('action:undo:client', subscriptions.undo)
            socket.on('action:error', subscriptions.error)
            socket.on('point:next:client', subscriptions.point)
        })

        setWaiting(false)
        setError('')
        return () => {
            // TODO: new socket implementation
            socket.removeAllListeners()
            socket.disconnect()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, game._id, point._id])

    const activePlayers = React.useMemo(() => {
        if (team === 'one') {
            return point.teamOneActivePlayers ?? []
        } else {
            return point.teamTwoActivePlayers ?? []
        }
    }, [point, team])

    const myTeamActions = React.useMemo(() => {
        return actions.filter(
            a => (a.action as LiveServerActionData).teamNumber === team,
        )
    }, [actions, team])

    const lastAction = React.useMemo(() => {
        if (myTeamActions.length > 0) {
            return myTeamActions[myTeamActions.length - 1]
        }
        return undefined
    }, [myTeamActions])

    const handleAction = async (action: Action) => {
        setWaiting(true)
        if (offline) {
            const { action: newAction, point: updatedPoint } =
                await createOfflineAction(action, point._id)
            successfulResponse(updatedPoint)
            setActions(immutableActionAddition(newAction))
        } else {
            // TODO: new socket implementation
            const clientAction = parseClientAction({ ...action.action })
            socket?.emit(
                'action',
                JSON.stringify({ action: clientAction, pointId: point._id }),
            )
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onAction = React.useCallback(debounce(handleAction, 150), [
        offline,
        point,
        socket,
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
            // TODO: new socket implementation
            socket?.emit('action:undo', JSON.stringify({ pointId: point._id }))
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onUndo = React.useCallback(debounce(handleUndo, 150), [
        offline,
        point,
        socket,
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
            // TODO: new socket implementation
            // await nextPoint(point._id)
            socket?.emit('point:next', JSON.stringify({ pointId: point._id }))
        }
    }

    const onFinishGame = async () => {
        await finishPoint(point._id)
        if (!offline) {
            // TODO: new socket implementation
            // await nextPoint(point._id)
            socket?.emit('point:next', JSON.stringify({ pointId: point._id }))
        }
        await finishGame()
        dispatch(resetGame())
        dispatch(resetPoint())
    }

    const onEditGame = async (gameData: UpdateGame) => {
        const data = parseUpdateGame(gameData)
        const result = await editGame(game._id, data)
        dispatch(setGame(result))
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
