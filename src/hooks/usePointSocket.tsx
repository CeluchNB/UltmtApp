import { ClientActionData } from '../types/action'
import EventEmitter from 'eventemitter3'
import { SocketAck } from '../types/services'
import useSocket from './useSocket'
import { LocalPointEvents, NetworkPointEvents } from '../types/point'
import { useEffect, useState } from 'react'

// Interface between event emitter and websocket data actions
const usePointSocket = (gameId: string, pointId: string) => {
    const socket = useSocket(pointId.length !== 0)

    const [emitter] = useState(new EventEmitter())

    useEffect(() => {
        if (!socket) return

        socket.off(NetworkPointEvents.ACTION_LISTEN)
        socket.on(NetworkPointEvents.ACTION_LISTEN, data => {
            emitter.emit(LocalPointEvents.ACTION_LISTEN, data)
        })
        socket.off(NetworkPointEvents.UNDO_LISTEN)
        socket.on(NetworkPointEvents.UNDO_LISTEN, data => {
            emitter.emit(LocalPointEvents.UNDO_LISTEN, data)
        })
        socket.off(NetworkPointEvents.ERROR_LISTEN)
        socket.on(NetworkPointEvents.ERROR_LISTEN, data => {
            emitter.emit(LocalPointEvents.ERROR_LISTEN, data)
        })
        socket.off(NetworkPointEvents.NEXT_POINT_LISTEN)
        socket.on(NetworkPointEvents.NEXT_POINT_LISTEN, () => {
            emitter.emit(LocalPointEvents.NEXT_POINT_LISTEN)
        })

        if (pointId) {
            socket.emit(NetworkPointEvents.JOIN_POINT_EMIT, gameId, pointId)
            socket.io.on('reconnect', () => {
                socket.emit(NetworkPointEvents.JOIN_POINT_EMIT, gameId, pointId)
            })
        }

        emitter.off(LocalPointEvents.ACTION_EMIT)
        emitter.addListener(LocalPointEvents.ACTION_EMIT, onAction)
        emitter.off(LocalPointEvents.UNDO_EMIT)
        emitter.addListener(LocalPointEvents.UNDO_EMIT, onUndo)
        emitter.off(LocalPointEvents.NEXT_POINT_EMIT)
        emitter.addListener(LocalPointEvents.NEXT_POINT_EMIT, onNextPoint)
        emitter.off(LocalPointEvents.COMMENT_EMIT)
        emitter.addListener(LocalPointEvents.COMMENT_EMIT, onComment)
        emitter.off(LocalPointEvents.DELETE_COMMENT_EMIT)
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
            (response: SocketAck) => {
                if (response.status === 'error') {
                    emitter.emit(
                        LocalPointEvents.ERROR_LISTEN,
                        response.message,
                    )
                }
            },
        )
    }

    const onUndo = () => {
        socket?.emit(
            NetworkPointEvents.UNDO_EMIT,
            JSON.stringify({ pointId }),
            (response: SocketAck) => {
                if (response.status === 'error') {
                    emitter.emit(
                        LocalPointEvents.ERROR_LISTEN,
                        response.message,
                    )
                }
            },
        )
    }

    const onNextPoint = () => {
        socket?.emit(
            NetworkPointEvents.NEXT_POINT_EMIT,
            JSON.stringify({ pointId }),
            (response: SocketAck) => {
                if (response.status === 'error') {
                    emitter.emit(
                        LocalPointEvents.ERROR_LISTEN,
                        response.message,
                    )
                }
            },
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
            (response: SocketAck) => {
                if (response.status === 'error') {
                    emitter.emit(
                        LocalPointEvents.ERROR_LISTEN,
                        response.message,
                    )
                }
            },
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
            (response: SocketAck) => {
                if (response.status === 'error') {
                    emitter.emit(
                        LocalPointEvents.ERROR_LISTEN,
                        response.message,
                    )
                }
            },
        )
    }

    return emitter
}

export default usePointSocket
