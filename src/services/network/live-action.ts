import EncryptedStorage from 'react-native-encrypted-storage'
import { TeamNumber } from '../../types/team'
import { WEBSOCKET_URL } from '@env'
import { ClientActionData, SubscriptionObject } from '../../types/action'
import { Socket, io } from 'socket.io-client'

let socket: Socket
const getSocket = async (forceNew = false): Promise<Socket> => {
    if (!socket || forceNew) {
        const token = (await EncryptedStorage.getItem('game_token')) || ''
        socket = io(WEBSOCKET_URL, {
            extraHeaders: { Authorization: `Bearer ${token}` },
            forceNew,
        })
    } else if (socket.disconnected) {
        socket.connect()
    }
    return socket
}

export const joinPoint = async (gameId: string, pointId: string) => {
    const pointSocket = await getSocket()

    pointSocket.emit('join:point', gameId, pointId)

    pointSocket.io.on('reconnect', () => {
        console.log('emit join point')
        pointSocket.emit('join:point', gameId, pointId)
    })
}

export const createAction = async (
    action: ClientActionData,
    pointId: string,
) => {
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
    teamNumber: TeamNumber,
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
    teamNumber: TeamNumber,
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
    actionSocket.emit('point:next', JSON.stringify({ pointId }))
}

export const subscribe = async (subscriptions: SubscriptionObject) => {
    const actionSocket = await getSocket()

    actionSocket.removeAllListeners()
    if (!actionSocket.hasListeners('action:client')) {
        console.log('adding client listener')
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
}

export const unsubscribe = () => {
    socket?.removeAllListeners()
    socket?.disconnect()
}
