import { LiveGameWizardState } from '../../types/game'
import PointEditView from './PointEditView'
import React from 'react'
import SelectPlayersView from './SelectPlayersView'

interface LiveGameActionViewProps {
    state: LiveGameWizardState
    onNavigate: () => void
}

const LiveGameActionView: React.FC<LiveGameActionViewProps> = ({
    state,
    onNavigate,
}) => {
    return (
        <>
            {state === LiveGameWizardState.SET_PLAYERS && (
                <SelectPlayersView onNavigate={onNavigate} />
            )}
            {state === LiveGameWizardState.LOG_ACTIONS && <PointEditView />}
        </>
    )
}

export default LiveGameActionView
