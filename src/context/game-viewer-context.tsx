import usePoint from '../hooks/usePoint'
import React, { createContext } from 'react'

export const GameViewerContext = createContext({})

const GameViewerProvider = ({
    children,
    gameId,
    pointId,
}: {
    children: React.ReactNode
    gameId: string
    pointId: string
}) => {
    const { teamOneActions, teamTwoActions } = usePoint(gameId, pointId)

    return (
        <GameViewerContext.Provider value={{ teamOneActions, teamTwoActions }}>
            {children}
        </GameViewerContext.Provider>
    )
}

export default GameViewerProvider
