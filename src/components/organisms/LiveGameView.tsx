import BaseScreen from '../atoms/BaseScreen'
import GameHeader from '../molecules/GameHeader'
import { LiveGameContext } from '../../context/live-game-context'
import LiveGameWizard from './LiveGameWizard'
import React, { useContext } from 'react'

const LiveGameView: React.FC<{}> = () => {
    const { game } = useContext(LiveGameContext)

    return (
        <BaseScreen containerWidth={100}>
            {game && <GameHeader game={game} editing={true} header={true} />}
            <LiveGameWizard />
        </BaseScreen>
    )
}

export default LiveGameView
