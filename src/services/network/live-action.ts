import EncryptedStorage from 'react-native-encrypted-storage'
import { WEBSOCKET_URL } from 'react-native-dotenv'
import { ClientAction, SubscriptionObject } from '../../types/action'
import { Socket, io } from 'socket.io-client'

let socket: Socket
const getSocket = async (): Promise<Socket> => {
    if (!socket) {
        const token = (await EncryptedStorage.getItem('game_token')) || ''
        socket = io(WEBSOCKET_URL, {
            extraHeaders: { Authorization: `Bearer ${token}` },
        })
        socket.on('disconnect', reason => {
            console.log('disconnected', reason)
        })
    } else if (socket.disconnected) {
        socket.connect()
    }
    return socket
}

const performOnceConnected = (
    actionSocket: Socket,
    method: (...args: any[]) => void,
) => {
    if (actionSocket.connected) {
        method()
    } else {
        actionSocket.on('connect', () => {
            method()
        })
    }
}

export const joinPoint = async (gameId: string, pointId: string) => {
    const pointSocket = await getSocket()
    performOnceConnected(pointSocket, () =>
        pointSocket.emit('join:point', gameId, pointId),
    )
}

export const createAction = async (action: ClientAction, pointId: string) => {
    const actionSocket = await getSocket()
    actionSocket.emit('action', JSON.stringify({ action, pointId }))
}

export const undoAction = async (pointId: string) => {
    const actionSocket = await getSocket()
    actionSocket.emit('action:undo', JSON.stringify({ pointId }))
}

export const addComment = async (
    jwt: string,
    gameId: string,
    pointId: string,
    actionNumber: number,
    teamNumber: 'one' | 'two',
    comment: string,
) => {
    const actionSocket = await getSocket()
    actionSocket.emit(
        'action:comment',
        JSON.stringify({
            jwt,
            gameId,
            pointId,
            actionNumber,
            teamNumber,
            comment,
        }),
    )
}

export const deleteComment = async (
    jwt: string,
    gameId: string,
    pointId: string,
    actionNumber: number,
    teamNumber: 'one' | 'two',
    commentNumber: string,
) => {
    const actionSocket = await getSocket()
    actionSocket.emit(
        'action:comment:delete',
        JSON.stringify({
            jwt,
            gameId,
            pointId,
            actionNumber,
            teamNumber,
            commentNumber,
        }),
    )
}

export const nextPoint = async (pointId: string) => {
    const actionSocket = await getSocket()
    console.log('got socket')
    actionSocket.emit('point:next', JSON.stringify({ pointId }))
}

export const subscribe = async (subscriptions: SubscriptionObject) => {
    const actionSocket = await getSocket()
    performOnceConnected(actionSocket, () => {
        actionSocket.removeAllListeners()
        if (!actionSocket.hasListeners('action:client')) {
            actionSocket.on('action:client', subscriptions.client)
        }
        if (!actionSocket.hasListeners('action:undo:client')) {
            actionSocket.on('action:undo:client', subscriptions.undo)
        }
        if (!actionSocket.hasListeners('action:error')) {
            actionSocket.on('action:error', subscriptions.error)
        }
        if (!actionSocket.hasListeners('point:next:client')) {
            actionSocket.on('point:next:client', subscriptions.point)
        }
    })
}

export const unsubscribe = () => {
    socket?.removeAllListeners()
    socket?.disconnect()
}
