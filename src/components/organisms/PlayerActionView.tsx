import { DisplayUser } from '../../types/user'
import PlayerActionItem from '../molecules/PlayerActionItem'
import React from 'react'
import { getValidPlayerActions } from '../../utils/action'
import { Action, LiveServerAction } from '../../types/action'
import { FlatList, View } from 'react-native'

interface PlayerActionViewProps {
    players: DisplayUser[]
    pulling: boolean
    actionStack: LiveServerAction[]
    loading: boolean
    onAction: (action: Action) => Promise<void>
}

type PlayerAction = {
    player: DisplayUser
    actions: Action[]
}

const PlayerActionView: React.FC<PlayerActionViewProps> = ({
    players,
    pulling,
    actionStack,
    loading,
    onAction,
}) => {
    const playerActions: PlayerAction[] = React.useMemo(() => {
        const actions = []
        for (const player of players) {
            let action = getValidPlayerActions(
                player._id,
                actionStack.slice(),
                pulling,
            )
            actions.push(action)
        }

        return actions.map((action, index) => {
            return { player: players[index], actions: action }
        })
    }, [players, actionStack, pulling])

    return (
        <View>
            <FlatList
                listKey="player-action-list"
                data={playerActions}
                renderItem={({ item, index }) => {
                    const { player, actions } = item
                    return (
                        <PlayerActionItem
                            key={index}
                            player={player}
                            actions={actions}
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
