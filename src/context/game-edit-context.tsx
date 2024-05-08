import React, { ReactNode, createContext } from 'react'

interface GameEditContextData {}

export const GameEditContext = createContext<GameEditContextData>({})

const GameEditProvider = ({ children }: { children: ReactNode }) => {
    const nextPoint = () => {}

    const backPoint = () => {}

    const finishGame = () => {}

    return (
        <GameEditContext.Provider value={{}}>
            {children}
        </GameEditContext.Provider>
    )
}

export default GameEditProvider
