import { WEBSOCKET_URL } from '@env'
import { getGameToken } from '../services/data/game'
import { Socket, io } from 'socket.io-client'
import { useEffect, useState } from 'react'

// Base implementation to set up a socket
const useSocket = (connect = true): Socket | undefined => {
    const [socket, setSocket] = useState<Socket>()

    useEffect(() => {
        if (!connect) return
        let effectSocket: Socket
        getGameToken().then(token => {
            if (token) {
                effectSocket = io(WEBSOCKET_URL, {
                    extraHeaders: { Authorization: `Bearer ${token}` },
                })
            } else {
                effectSocket = io(WEBSOCKET_URL)
            }
            setSocket(effectSocket)
        })
    }, [connect])

    useEffect(() => {
        return () => {
            socket?.close()
        }
    }, [socket])

    return socket
}

export default useSocket
