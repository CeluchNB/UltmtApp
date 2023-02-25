import { DisplayUser } from '../../types/user'
import PlayerActionItem from '../molecules/PlayerActionItem'
import React from 'react'
import { TeamNumber } from '../../types/team'
import { Action, ActionList, PlayerActionList } from '../../types/action'
import { FlatList, View } from 'react-native'

interface PlayerActionViewProps {
    players: DisplayUser[]
    pulling: boolean
    actionStack: Action[]
    loading: boolean
    team: TeamNumber
    onAction: (action: Action) => Promise<void>
}

type PlayerAction = {
    player: DisplayUser
    actions: ActionList
}

const PlayerActionView: React.FC<PlayerActionViewProps> = ({
    players,
    pulling,
    actionStack,
    loading,
    team,
    onAction,
}) => {
    const playerActions: PlayerAction[] = React.useMemo(() => {
        const actions: ActionList[] = []
        for (const player of players) {
            let action = new PlayerActionList(
                player,
                actionStack,
                team,
                pulling,
            )
            actions.push(action)
        }

        return actions.map((action, index) => {
            return { player: players[index], actions: action }
        })
    }, [players, actionStack, pulling, team])

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
