import { LiveGameContext } from '../../context/live-game-context'
import { LiveGameWizardState } from '../../types/game'
import PointEditView from './PointEditView'
import SelectPlayersView from './SelectPlayersView'
import React, { useContext } from 'react'

interface LiveGameActionView {
    next: () => {}
    back: () => {}
}

const LiveGameActionView: React.FC<{}> = () => {
    const {
        wizardState: { state },
    } = useContext(LiveGameContext)

    return (
        <>
            {state === LiveGameWizardState.SET_PLAYERS && <SelectPlayersView />}
            {state === LiveGameWizardState.LOG_ACTIONS && <PointEditView />}
        </>
    )
}

export default LiveGameActionView
