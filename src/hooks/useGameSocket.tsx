import { SubscriptionObject } from '../types/action'
import useSocket from './useSocket'
import { useCallback, useEffect, useRef } from 'react'

export interface GameSocket {
    subscribe: (
        subscriptions: SubscriptionObject,
        gameId: string,
        pointId: string,
    ) => void
    on: (event: string, method: (...args: any[]) => void) => void
    emit: (event: string, data: string) => void
}
const useGameSocket = (): GameSocket => {
    // TODO: SOCKET - seems like we have multiple sockets?
    const socket = useSocket()

    const listeners = useRef<
        { event: string; method: (...args: any[]) => void }[]
    >([])
    const connections = useRef<{ room: string; data: any[] }[]>([])

    useEffect(() => {
        if (socket) {
            socket.removeAllListeners()
            for (const listener of listeners.current) {
                socket.on(listener.event, listener.method)
            }

            while (connections.current.length > 0) {
                const connection = connections.current.pop()
                if (!connection) continue

                socket.emit(connection.room, ...connection.data)
                socket.io.on('reconnect', () => {
                    socket.emit(connection.room, ...connection.data)
                })
            }
        }
    }, [socket, listeners, connections])

    const subscribe = useCallback(
        (
            subscriptions: SubscriptionObject,
            gameId: string,
            pointId: string,
        ) => {
            // TODO - this method is called way too much, only need once

            join('join:point', gameId, pointId)
            on('action:client', subscriptions.client)
            on('action:undo:client', subscriptions.undo)
            on('action:error', subscriptions.error)
            on('point:next:client', subscriptions.point)
        },
        [],
    )

    const on = (event: string, method: (...args: any[]) => void) => {
        // TODO: this doesn't work b/c of duplicate sockets
        listeners.current.push({ event, method })
    }

    const join = (room: string, ...data: any[]) => {
        connections.current.push({ room, data })
    }

    const emit = useCallback(
        (event: string, data: string) => {
            if (!socket) return

            socket.emit(event, data)
        },
        [socket],
    )

    return { subscribe, on, emit }
}

export default useGameSocket
