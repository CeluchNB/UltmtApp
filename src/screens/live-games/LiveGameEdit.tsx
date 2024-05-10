import { LiveGameProps } from '../../types/navigation'
import LiveGameProvider from '../../context/live-game-context'
import LiveGameView from '../../components/organisms/LiveGameView'
import React from 'react'

const LiveGameEditScreen: React.FC<LiveGameProps> = ({ route }) => {
    const { gameId } = route.params

    return (
        <LiveGameProvider gameId={gameId}>
            <LiveGameView />
        </LiveGameProvider>
    )
}

export default LiveGameEditScreen
