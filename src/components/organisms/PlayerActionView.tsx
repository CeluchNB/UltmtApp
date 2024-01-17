import { DisplayUser } from '../../types/user'
import PlayerActionItem from '../molecules/PlayerActionItem'
import { PointEditContext } from '../../context/point-edit-context'
import { TeamNumber } from '../../types/team'
import {
    ActionList,
    LiveServerActionData,
    PlayerActionList,
} from '../../types/action'
import { FlatList, View } from 'react-native'
import React, { useContext } from 'react'

interface PlayerActionViewProps {
    pulling: boolean
    actionStack: LiveServerActionData[]
    loading: boolean
    team: TeamNumber
}

type PlayerAction = {
    player: DisplayUser
    actions: ActionList
}

const PlayerActionView: React.FC<PlayerActionViewProps> = ({
    pulling,
    actionStack,
    loading,
    team,
}) => {
    const { activePlayers, onAction } = useContext(PointEditContext)

    const playerActions: PlayerAction[] = React.useMemo(() => {
        const actions: ActionList[] = []
        for (const player of activePlayers) {
            let action = new PlayerActionList(
                player,
                actionStack,
                team,
                pulling,
            )
            actions.push(action)
        }

        return actions.map((action, index) => {
            return { player: activePlayers[index], actions: action }
        })
    }, [activePlayers, actionStack, pulling, team])

    return (
        <View>
            <FlatList
                data={playerActions}
                renderItem={({ item, index }) => {
                    const { player, actions } = item
                    return (
                        <PlayerActionItem
                            key={index}
                            player={player}
                            actions={actions.actionList}
                            loading={loading}
                            onAction={onAction}
                        />
                    )
                }}
            />
        </View>
    )
}

export default PlayerActionView
