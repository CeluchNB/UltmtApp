import GameView from '../../components/organisms/GameView'
import GameViewProvider from '../../context/game-view-context'
import React from 'react'
import { ViewGameProps } from '../../types/navigation'

const ViewGameScreen: React.FC<ViewGameProps> = ({ route }) => {
    const {
        params: { gameId },
    } = route

    return (
        <GameViewProvider gameId={gameId}>
            <GameView gameId={gameId} />
        </GameViewProvider>
    )
}

export default ViewGameScreen
