import EncryptedStorage from 'react-native-encrypted-storage'
import { Platform } from 'react-native'
import { WEBSOCKET_URL } from '@env'
import { Socket, io } from 'socket.io-client'
import { useEffect, useState } from 'react'

const useSocket = (): Socket | undefined => {
    const [socket, setSocket] = useState<Socket>()

    useEffect(() => {
        let effectSocket: Socket
        EncryptedStorage.getItem('game_token').then(token => {
            effectSocket = io(WEBSOCKET_URL, {
                extraHeaders: { Authorization: `Bearer ${token}` },
            })

            effectSocket.io.on('ping', () => {
                console.log('ping')
            })
            effectSocket.io.on('packet', () => {
                console.log('packet', Platform.OS)
            })
            effectSocket.io.on('reconnect_attempt', () => {
                console.log('reconnect_attempt', Platform.OS)
            })
            effectSocket.io.on('reconnect', () => {
                console.log('reconnect', Platform.OS)
            })
            effectSocket.io.on('open', () => {
                console.log('open', Platform.OS)
            })
            setSocket(effectSocket)
        })
        return () => {
            effectSocket?.close()
        }
    }, [])

    return socket
}

export default useSocket
