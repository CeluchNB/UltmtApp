import ActionAdvertisement from '../atoms/ActionAdvertisement'
import ActionDisplayItem from '../atoms/ActionDisplayItem'
import { GuestTeam } from '../../types/team'
import React from 'react'
import { Action, ServerActionData } from '../../types/action'

interface ActionDisplayMediatorProps {
    action: Action | { ad: boolean }
    onPress: (action: ServerActionData) => void
    teamOne: GuestTeam
    teamTwo: GuestTeam
}

const ActionDisplayMediator: React.FC<ActionDisplayMediatorProps> = ({
    action,
    onPress,
    teamOne,
    teamTwo,
}) => {
    if (Object.keys(action).includes('ad')) {
        return <ActionAdvertisement />
    } else {
        const castedAction = action as Action
        return (
            <ActionDisplayItem
                action={castedAction}
                onPress={onPress}
                teamOne={teamOne}
                teamTwo={teamTwo}
            />
        )
    }
}

export default ActionDisplayMediator
