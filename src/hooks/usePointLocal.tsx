import EventEmitter from 'eventemitter3'
import { LocalPointEvents } from '../types/point'
import { activeGameOffline } from '../services/data/game'
import { setPoint } from '../store/reducers/features/point/livePointReducer'
import { useDispatch } from 'react-redux'
import usePointSocket from './usePointSocket'
import { ClientActionData, LiveServerActionData } from '../types/action'
import {
    createOfflineAction,
    deleteLocalAction,
    saveLocalAction,
    undoOfflineAction,
} from '../services/data/live-action'
import { useCallback, useEffect, useState } from 'react'

// This hook mediates between local and backend data
const usePointLocal = (gameId: string, pointId: string) => {
    const networkEmitter = usePointSocket(gameId, pointId)
    const [localEmitter] = useState(new EventEmitter())
    const [offline, setOffline] = useState(false)
    const dispatch = useDispatch()

    const emitOrHandle = useCallback(
        (event: string, data?: unknown) => {
            if (offline) {
                handleOfflineEvent(event, data)
            } else {
                networkEmitter.emit(event, data)
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [offline],
    )

    useEffect(() => {
        activeGameOffline().then(isOffline => {
            setOffline(isOffline)
        })

        localEmitter.off(LocalPointEvents.ACTION_EMIT)
        localEmitter.on(LocalPointEvents.ACTION_EMIT, data =>
            emitOrHandle(LocalPointEvents.ACTION_EMIT, data),
        )
        localEmitter.off(LocalPointEvents.UNDO_EMIT)
        localEmitter.on(LocalPointEvents.UNDO_EMIT, data => {
            emitOrHandle(LocalPointEvents.UNDO_EMIT, data)
        })
        localEmitter.off(LocalPointEvents.NEXT_POINT_EMIT)
        localEmitter.on(LocalPointEvents.NEXT_POINT_EMIT, () => {
            emitOrHandle(LocalPointEvents.NEXT_POINT_EMIT)
        })
        localEmitter.off(LocalPointEvents.COMMENT_EMIT)
        localEmitter.on(LocalPointEvents.COMMENT_EMIT, data => {
            networkEmitter.emit(LocalPointEvents.COMMENT_EMIT, data)
        })
        localEmitter.off(LocalPointEvents.DELETE_COMMENT_EMIT)
        localEmitter.on(LocalPointEvents.DELETE_COMMENT_EMIT, data => {
            networkEmitter.emit(LocalPointEvents.DELETE_COMMENT_EMIT, data)
        })

        networkEmitter.off(LocalPointEvents.ACTION_LISTEN)
        networkEmitter.on(LocalPointEvents.ACTION_LISTEN, async data => {
            await handleOnlineEvent(LocalPointEvents.ACTION_LISTEN, data)
        })
        networkEmitter.off(LocalPointEvents.UNDO_LISTEN)
        networkEmitter.on(LocalPointEvents.UNDO_LISTEN, async data => {
            await handleOnlineEvent(LocalPointEvents.UNDO_LISTEN, data)
        })
        networkEmitter.off(LocalPointEvents.NEXT_POINT_LISTEN)
        networkEmitter.on(LocalPointEvents.NEXT_POINT_LISTEN, async data => {
            await handleOnlineEvent(LocalPointEvents.NEXT_POINT_LISTEN, data)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emitOrHandle])

    const handleOnlineEvent = async (event: string, data: any) => {
        switch (event) {
            case LocalPointEvents.ACTION_LISTEN:
                const { action: newAction, point: actionUpdatePoint } =
                    await saveLocalAction(data as LiveServerActionData, pointId)

                dispatch(setPoint(actionUpdatePoint))
                localEmitter.emit(
                    LocalPointEvents.ACTION_LISTEN,
                    newAction.action,
                )
                break
            case LocalPointEvents.UNDO_LISTEN:
                const { team, actionNumber } = data
                const { action: deletedAction, point: undoUpdatePoint } =
                    await deleteLocalAction(team, actionNumber, pointId)

                dispatch(setPoint(undoUpdatePoint))
                localEmitter.emit(LocalPointEvents.UNDO_LISTEN, {
                    team: deletedAction.teamNumber,
                    actionNumber: deletedAction.actionNumber,
                })
                break
            case LocalPointEvents.NEXT_POINT_LISTEN:
                localEmitter.emit(LocalPointEvents.NEXT_POINT_LISTEN)
                break
        }
    }

    const handleOfflineEvent = async (event: string, data?: unknown) => {
        switch (event) {
            case LocalPointEvents.ACTION_EMIT:
                const { action: newAction, point: actionUpdatePoint } =
                    await createOfflineAction(data as ClientActionData, pointId)

                dispatch(setPoint(actionUpdatePoint))
                localEmitter.emit(
                    LocalPointEvents.ACTION_LISTEN,
                    newAction.action,
                )
                break
            case LocalPointEvents.UNDO_EMIT:
                const { action: deletedAction, point: undoUpdatePoint } =
                    await undoOfflineAction(pointId)

                dispatch(setPoint(undoUpdatePoint))
                localEmitter.emit(LocalPointEvents.UNDO_LISTEN, {
                    team: deletedAction.teamNumber,
                    actionNumber: deletedAction.actionNumber,
                })
                break
            case LocalPointEvents.NEXT_POINT_EMIT:
                localEmitter.emit(LocalPointEvents.NEXT_POINT_LISTEN)
                break
        }
    }

    return localEmitter
}

export default usePointLocal
