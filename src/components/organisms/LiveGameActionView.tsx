import { LiveGameWizardState } from '../../types/game'
import PointEditView from './PointEditView'
import React from 'react'
import SelectPlayersView from './SelectPlayersView'

interface LiveGameActionViewProps {
    state: LiveGameWizardState
}

const LiveGameActionView: React.FC<LiveGameActionViewProps> = ({ state }) => {
    return (
        <>
            {state === LiveGameWizardState.SET_PLAYERS && <SelectPlayersView />}
            {state === LiveGameWizardState.LOG_ACTIONS && <PointEditView />}
        </>
    )
}

export default LiveGameActionView
