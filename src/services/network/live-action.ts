import EncryptedStorage from 'react-native-encrypted-storage'
import { WEBSOCKET_URL } from 'react-native-dotenv'
import { ClientAction, SubscriptionObject } from '../../types/action'
import { Socket, io } from 'socket.io-client'

let socket: Socket
const getSocket = async (): Promise<Socket> => {
    if (!socket?.connected) {
        const token = (await EncryptedStorage.getItem('game_token')) || ''
        socket = io(WEBSOCKET_URL, {
            extraHeaders: { Authorization: `Bearer ${token}` },
        })
    }
    socket.on('disconnect', reason => {
        console.log('disconnected', reason)
    })
    return socket
}

export const joinPoint = async (gameId: string, pointId: string) => {
    const pointSocket = await getSocket()
    pointSocket.emit('join:point', gameId, pointId)
}

export const createAction = async (action: ClientAction, pointId: string) => {
    const actionSocket = await getSocket()
    actionSocket.emit('action', JSON.stringify({ action, pointId }))
}

export const undoAction = async (pointId: string) => {
    const actionSocket = await getSocket()
    actionSocket.emit('action:undo', JSON.stringify({ pointId }))
}

export const subscribe = async (subscriptions: SubscriptionObject) => {
    const actionSocket = await getSocket()
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
}

export const unsubscribe = async () => {
    socket.removeAllListeners()
    socket.disconnect()
}
