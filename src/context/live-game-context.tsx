import { GameSchema } from '../models'
import { useObject } from './realm'
import React, { ReactNode, createContext } from 'react'

interface LiveGameContextData {
    game: GameSchema | null
}

export const LiveGameContext = createContext<LiveGameContextData>(
    {} as LiveGameContextData,
)

const LiveGameProvider = ({
    children,
    gameId,
}: {
    children: ReactNode
    gameId: string
}) => {
    const game = useObject<GameSchema>('Game', gameId)

    return (
        <LiveGameContext.Provider value={{ game }}>
            {children}
        </LiveGameContext.Provider>
    )
}

export default LiveGameProvider
