import EventEmitter from 'eventemitter3'
import { LiveGameContext } from '../context/live-game-context'
import { LocalPointEvents } from '../types/point'
import { useCreateAction } from './game-edit-actions/use-create-action'
import usePointSocket from './usePointSocket'
import { useUndoAction } from './game-edit-actions/use-undo-action'
import { useContext, useEffect, useState } from 'react'

// This hook mediates between local and backend data
const usePointLocal = () => {
    const { game, point, team } = useContext(LiveGameContext)
    const networkEmitter = usePointSocket(game?._id ?? '', point?._id ?? '')
    const [localEmitter] = useState(new EventEmitter())

    const { mutateAsync: createAction } = useCreateAction()
    const { mutateAsync: undoAction } = useUndoAction()

    const emitToListen = (event: string) => {
        switch (event) {
            case LocalPointEvents.ACTION_EMIT:
                return LocalPointEvents.ACTION_LISTEN
            case LocalPointEvents.UNDO_EMIT:
                return LocalPointEvents.UNDO_LISTEN
            case LocalPointEvents.NEXT_POINT_EMIT:
                return LocalPointEvents.NEXT_POINT_LISTEN
            default:
                return LocalPointEvents.ACTION_EMIT
        }
    }

    const emitOrHandle = async (event: string, data?: unknown) => {
        if (game?.offline) {
            await handleEvent(emitToListen(event), data)
        } else {
            networkEmitter.emit(event, data)
        }
    }

    useEffect(() => {
        localEmitter.off(LocalPointEvents.ACTION_EMIT)
        localEmitter.on(
            LocalPointEvents.ACTION_EMIT,
            async data =>
                await emitOrHandle(LocalPointEvents.ACTION_EMIT, data),
        )
        localEmitter.off(LocalPointEvents.UNDO_EMIT)
        localEmitter.on(LocalPointEvents.UNDO_EMIT, async data => {
            await emitOrHandle(LocalPointEvents.UNDO_EMIT, data)
        })
        localEmitter.off(LocalPointEvents.NEXT_POINT_EMIT)
        localEmitter.on(LocalPointEvents.NEXT_POINT_EMIT, async () => {
            await emitOrHandle(LocalPointEvents.NEXT_POINT_EMIT)
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
            await handleEvent(LocalPointEvents.ACTION_LISTEN, data)
        })
        networkEmitter.off(LocalPointEvents.UNDO_LISTEN)
        networkEmitter.on(LocalPointEvents.UNDO_LISTEN, async data => {
            await handleEvent(LocalPointEvents.UNDO_LISTEN, data)
        })
        networkEmitter.off(LocalPointEvents.NEXT_POINT_LISTEN)
        networkEmitter.on(LocalPointEvents.NEXT_POINT_LISTEN, async data => {
            await handleEvent(LocalPointEvents.NEXT_POINT_LISTEN, data)
        })
        networkEmitter.off(LocalPointEvents.ERROR_LISTEN)
        networkEmitter.on(LocalPointEvents.ERROR_LISTEN, async message => {
            localEmitter.emit(LocalPointEvents.ERROR_LISTEN, message)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [emitOrHandle, point])

    const handleEvent = async (event: string, data: any) => {
        switch (event) {
            case LocalPointEvents.ACTION_LISTEN:
                const action = await createAction(data)

                localEmitter.emit(LocalPointEvents.ACTION_LISTEN, action)
                break
            case LocalPointEvents.UNDO_LISTEN:
                const actionNumber = await undoAction()

                localEmitter.emit(LocalPointEvents.UNDO_LISTEN, {
                    team,
                    actionNumber,
                })
                break
            case LocalPointEvents.NEXT_POINT_LISTEN:
                localEmitter.emit(LocalPointEvents.NEXT_POINT_LISTEN)
                break
        }
    }

    return localEmitter
}

export default usePointLocal
