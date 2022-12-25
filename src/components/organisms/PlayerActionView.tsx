import { ClientActionType } from '../../types/action'
import { DisplayUser } from '../../types/user'
import PlayerActionItem from '../molecules/PlayerActionItem'
import React from 'react'
import { getValidPlayerActions } from '../../utils/action'
import { FlatList, View } from 'react-native'

interface PlayerActionViewProps {
    players: DisplayUser[]
    pulling: boolean
    prevAction?: ClientActionType
    activePlayer?: string
    loading: boolean
    onAction: (
        action: ClientActionType,
        tags: string[],
        playerOne: DisplayUser,
    ) => void
}

type PlayerAction = {
    player: DisplayUser
    actions: ClientActionType[]
}

const PlayerActionView: React.FC<PlayerActionViewProps> = ({
    players,
    pulling,
    prevAction,
    activePlayer,
    loading,
    onAction,
}) => {
    const playerActions: PlayerAction[] = React.useMemo(() => {
        const actions = []
        for (let i = 0; i < players.length; i++) {
            let action = getValidPlayerActions(
                players[i]._id,
                activePlayer || '',
                prevAction,
                pulling,
            )
            actions.push(action)
        }

        return actions.map((action, index) => {
            return { player: players[index], actions: action }
        })
    }, [players, activePlayer, prevAction, pulling])

    const onPress = (
        action: ClientActionType,
        tags: string[],
        player: DisplayUser,
    ) => {
        onAction(action, tags, player)
    }

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
                            actions={actions}
                            loading={loading}
                            onAction={(action, tags) => {
                                onPress(action, tags, player)
                            }}
                        />
                    )
                }}
            />
        </View>
    )
}

export default PlayerActionView
