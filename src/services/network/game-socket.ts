import EncryptedStorage from 'react-native-encrypted-storage'
import { WEBSOCKET_URL } from 'react-native-dotenv'
import { Socket, io } from 'socket.io-client'

let socket: Socket
export const getSocket = async (): Promise<Socket> => {
    if (!socket?.connected) {
        const token = (await EncryptedStorage.getItem('game_token')) || ''
        socket = io(WEBSOCKET_URL, {
            extraHeaders: { Authorization: `Bearer ${token}` },
        })
    }
    return socket
}
