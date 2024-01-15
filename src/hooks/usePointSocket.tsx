import { ClientActionData } from '../types/action'
import EventEmitter from 'eventemitter3'
import useSocket from './useSocket'
import { LocalPointEvents, NetworkPointEvents } from '../types/point'
import { useEffect, useState } from 'react'

// Interface between event emitter, websocket, and local data actions
const usePointSocket = (gameId: string, pointId: string) => {
    const socket = useSocket()

    const [emitter] = useState(new EventEmitter())

    useEffect(() => {
        if (!socket) return

        socket.on(NetworkPointEvents.ACTION_LISTEN, data => {
            emitter.emit(LocalPointEvents.ACTION_LISTEN, data)
        })
        socket.on(NetworkPointEvents.UNDO_LISTEN, data => {
            emitter.emit(LocalPointEvents.UNDO_LISTEN, data)
        })
        socket.on(NetworkPointEvents.ERROR_LISTEN, data => {
            emitter.emit(LocalPointEvents.ERROR_LISTEN, data)
        })
        socket.on(NetworkPointEvents.NEXT_POINT_LISTEN, () => {
            emitter.emit(LocalPointEvents.NEXT_POINT_LISTEN)
        })
        socket.emit(NetworkPointEvents.JOIN_POINT_EMIT, gameId, pointId)
        socket.io.on('reconnect', () => {
            socket.emit(NetworkPointEvents.JOIN_POINT_EMIT, gameId, pointId)
        })

        emitter.addListener(LocalPointEvents.ACTION_EMIT, onAction)
        emitter.addListener(LocalPointEvents.UNDO_EMIT, onUndo)
        emitter.addListener(LocalPointEvents.NEXT_POINT_EMIT, onNextPoint)
        emitter.addListener(LocalPointEvents.COMMENT_EMIT, onComment)
        emitter.addListener(
            LocalPointEvents.DELETE_COMMENT_EMIT,
            onDeleteComment,
        )

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, emitter, gameId, pointId])

    const onAction = (action: ClientActionData) => {
        socket?.emit(
            NetworkPointEvents.ACTION_EMIT,
            JSON.stringify({ action, pointId }),
        )
    }

    const onUndo = () => {
        socket?.emit(NetworkPointEvents.UNDO_EMIT, JSON.stringify({ pointId }))
    }

    const onNextPoint = () => {
        socket?.emit(
            NetworkPointEvents.NEXT_POINT_EMIT,
            JSON.stringify({ pointId }),
        )
    }

    const onComment = (
        jwt: string,
        actionNumber: number,
        teamNumber: string,
        comment: string,
    ) => {
        socket?.emit(
            NetworkPointEvents.COMMENT_EMIT,
            JSON.stringify({
                jwt,
                pointId,
                gameId,
                actionNumber,
                teamNumber,
                comment,
            }),
        )
    }

    const onDeleteComment = (
        jwt: string,
        actionNumber: number,
        teamNumber: string,
        commentNumber: number,
    ) => {
        socket?.emit(
            NetworkPointEvents.DELETE_COMMENT_EMIT,
            JSON.stringify({
                jwt,
                pointId,
                gameId,
                actionNumber,
                teamNumber,
                commentNumber,
            }),
        )
    }

    return emitter
}

export default usePointSocket
