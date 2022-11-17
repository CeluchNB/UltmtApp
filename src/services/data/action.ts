import { ClientAction } from '../../types/action'
import { getSocket } from '../network/game-socket'

export const joinPoint = async (gameId: string, pointId: string) => {
    const socket = await getSocket()
    socket.emit('join:point', gameId, pointId)
}

export const addAction = async (action: ClientAction, pointId: string) => {
    const socket = await getSocket()
    socket.emit('action', JSON.stringify({ action, pointId }))
}

export const listen = async () => {
    const socket = await getSocket()
    socket.on('action:client', data => {
        console.log('got action', data)
    })
    socket.on('action:error', data => {
        console.log('got error', data)
    })
}
