import EventEmitter from 'eventemitter3'
import { LiveServerActionData } from '../types/action'
import { LocalPointEvents } from '../types/point'
import { setPoint } from '../store/reducers/features/point/livePointReducer'
import { useDispatch } from 'react-redux'
import usePointSocket from './usePointSocket'
import {
    deleteLocalAction,
    saveLocalAction,
} from '../services/data/live-action'
import { useEffect, useState } from 'react'

const usePointLocal = (gameId: string, pointId: string, offline = true) => {
    const networkEmitter = usePointSocket(gameId, pointId)
    const [localEmitter] = useState(new EventEmitter())
    const dispatch = useDispatch()

    useEffect(() => {
        localEmitter.on(LocalPointEvents.ACTION_EMIT, data =>
            emitOrHandle(LocalPointEvents.ACTION_EMIT, data),
        )
        localEmitter.on(LocalPointEvents.UNDO_EMIT, data => {
            emitOrHandle(LocalPointEvents.UNDO_EMIT, data)
        })
        localEmitter.on(LocalPointEvents.NEXT_POINT_EMIT, () => {
            emitOrHandle(LocalPointEvents.NEXT_POINT_EMIT)
        })
        localEmitter.on(LocalPointEvents.COMMENT_EMIT, data => {
            // TODO: this data may be transmitted or read incorrectly
            networkEmitter.emit(LocalPointEvents.COMMENT_EMIT, ...data)
        })
        localEmitter.on(LocalPointEvents.DELETE_COMMENT_EMIT, data => {
            // TODO: this data may be transmitted or read incorrectly
            networkEmitter.emit(LocalPointEvents.DELETE_COMMENT_EMIT, ...data)
        })

        networkEmitter.on(LocalPointEvents.ACTION_LISTEN, async data => {
            await handleEvent(LocalPointEvents.ACTION_LISTEN, data)
        })
        networkEmitter.on(LocalPointEvents.UNDO_LISTEN, async data => {
            await handleEvent(LocalPointEvents.UNDO_LISTEN, data)
        })
        networkEmitter.on(LocalPointEvents.NEXT_POINT_LISTEN, async data => {
            await handleEvent(LocalPointEvents.NEXT_POINT_LISTEN, data)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const emitOrHandle = (event: string, data?: unknown) => {
        if (offline) {
            handleEvent(event, data)
        } else {
            networkEmitter.emit(event, data)
        }
    }

    const handleEvent = async (event: string, data: any) => {
        switch (event) {
            case LocalPointEvents.ACTION_EMIT:
            case LocalPointEvents.ACTION_LISTEN:
                console.log('action data in local layer', data)
                const { action: newAction, point: actionUpdatePoint } =
                    await saveLocalAction(data as LiveServerActionData, pointId)
                console.log('after save action', newAction)
                console.log('after save point', actionUpdatePoint)
                dispatch(setPoint(actionUpdatePoint))
                localEmitter.emit(LocalPointEvents.ACTION_LISTEN, newAction)
                break
            case LocalPointEvents.UNDO_EMIT:
            case LocalPointEvents.UNDO_LISTEN:
                console.log('undo data in local layer', data)
                const { team, actionNumber } = data
                const { action: deletedAction, point: undoUpdatePoint } =
                    await deleteLocalAction(team, actionNumber, pointId)
                dispatch(setPoint(undoUpdatePoint))
                localEmitter.emit(LocalPointEvents.UNDO_LISTEN, deletedAction)
                break
            case LocalPointEvents.NEXT_POINT_EMIT:
            case LocalPointEvents.NEXT_POINT_LISTEN:
                // TODO: implement handle
                localEmitter.emit(LocalPointEvents.NEXT_POINT_LISTEN)
                break
            case LocalPointEvents.COMMENT_EMIT:
                // TODO: implement handle
                localEmitter.emit(LocalPointEvents.ACTION_LISTEN, data)
                break
            case LocalPointEvents.DELETE_COMMENT_EMIT:
                // TODO: implement handle
                localEmitter.emit(LocalPointEvents.ACTION_LISTEN, data)
                break
            default:
                return
        }
    }

    return localEmitter
}

export default usePointLocal
