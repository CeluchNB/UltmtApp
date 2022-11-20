import { ActionType } from '../../types/action'
import { FlatList } from 'react-native'
import { GuestUser } from '../../types/user'
import PlayerActionItem from '../atoms/PlayerActionItem'
import React from 'react'
import { getPlayerValidActions } from '../../utils/actions'

interface PlayerActionViewProps {
    players: GuestUser[]
    pulling: boolean
    prevAction?: ActionType | 'score'
    activePlayer?: number
    onAction: (index: number, action: ActionType | 'score') => void
}

type PlayerAction = {
    player: GuestUser
    actions: (ActionType | 'score')[]
}

const PlayerActionView: React.FC<PlayerActionViewProps> = ({
    players,
    pulling,
    prevAction,
    activePlayer,
    onAction,
}) => {
    const playerActions: PlayerAction[] = React.useMemo(() => {
        const actions = []
        for (let i = 0; i < players.length; i++) {
            let action = getPlayerValidActions(
                i,
                activePlayer || 0,
                prevAction,
                pulling,
            )
            actions.push(action)
        }

        return actions.map((action, index) => {
            return { player: players[index], actions: action }
        })
    }, [players, activePlayer, prevAction, pulling])

    const onPress = (index: number, action: ActionType | 'score') => {
        onAction(index, action)
    }

    return (
        <FlatList
            data={playerActions}
            renderItem={({ item, index }) => {
                const { player, actions } = item
                return (
                    <PlayerActionItem
                        key={index}
                        player={player}
                        actions={actions}
                        onAction={action => {
                            onPress(index, action)
                        }}
                    />
                )
            }}
        />
    )
}

export default PlayerActionView
