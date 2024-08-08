import { LiveGameProps } from '../../types/navigation'
import LiveGameProvider from '../../context/live-game-context'
import LiveGameWizard from '../../components/organisms/LiveGameWizard'
import PointEditProvider from '../../context/point-edit-context'
import React from 'react'

const LiveGameEditScreen: React.FC<LiveGameProps> = ({ route }) => {
    const { gameId, team, pointNumber, state } = route.params

    return (
        <LiveGameProvider
            gameId={gameId}
            teamNumber={team}
            pointNumber={pointNumber}>
            <PointEditProvider>
                <LiveGameWizard state={state} />
            </PointEditProvider>
        </LiveGameProvider>
    )
}

export default LiveGameEditScreen
