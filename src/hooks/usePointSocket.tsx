import { ClientActionData } from '../types/action'
import EventEmitter from 'eventemitter3'
import { useEffect } from 'react'
import useSocket from './useSocket'

// Interface between event emitter, websocket, and local data actions
const usePointSocket = (gameId: string, pointId: string) => {
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        const emitter = new EventEmitter()

        socket.on('action:client', data => {
            emitter.emit('action:client:local', data)
        })
        socket.on('action:undo:client', data => {
            emitter.emit('action:undo:client:local', data)
        })
        socket.on('action:error', data => {
            emitter.emit('action:error:local', data)
        })
        socket.on('point:next:client', () => {
            emitter.emit('point:next:client:local')
        })
        socket.emit('join:point', gameId, pointId)
        socket.io.on('reconnect', () => {
            console.log('rejoining point')
            socket.emit('join:point', gameId, pointId)
        })

        emitter.addListener('action', onAction)
        emitter.addListener('action:undo', onUndo)
        emitter.addListener('point:next', onNextPoint)
        emitter.addListener('action:comment', onComment)
        emitter.addListener('action:comment:delete', onDeleteComment)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, gameId, pointId])

    const onAction = (action: ClientActionData) => {
        socket?.emit('action', JSON.stringify({ action, pointId }))
    }

    const onUndo = () => {
        socket?.emit('action:undo', JSON.stringify({ pointId }))
    }

    const onNextPoint = () => {
        socket?.emit('point:next', JSON.stringify({ pointId }))
    }

    const onComment = (
        jwt: string,
        actionNumber: number,
        teamNumber: string,
        comment: string,
    ) => {
        socket?.emit(
            'action:comment',
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
            'action:comment:delete',
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
}

export default usePointSocket
