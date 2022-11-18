import { FlatList } from 'react-native'
import { GuestUser } from '../../types/user'
import PlayerActionItem from '../atoms/PlayerActionItem'
import React from 'react'
import { getPlayerValidActions } from '../../utils/actions'

interface PlayerActionViewProps {
    players: GuestUser[]
    pulling: boolean
}

type PlayerAction = {
    player: GuestUser
    actions: string[]
}

const PlayerActionView: React.FC<PlayerActionViewProps> = ({
    players,
    pulling,
}) => {
    const [activePlayer, setActivePlayer] = React.useState<number>(0)
    const [prevAction, setPrevAction] = React.useState<string | undefined>(
        undefined,
    )

    const playerActions: PlayerAction[] = React.useMemo(() => {
        const actions = []
        for (let i = 0; i < players.length; i++) {
            let action = getPlayerValidActions(
                i,
                activePlayer,
                prevAction,
                pulling,
            )
            actions.push(action)
        }

        return actions.map((action, index) => {
            return { player: players[index], actions: action }
        })
    }, [players, activePlayer, prevAction, pulling])

    const onPress = (index: number, action: string) => {
        setActivePlayer(index)
        setPrevAction(action)
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
                        onPress={action => {
                            onPress(index, action)
                        }}
                    />
                )
            }}
        />
    )
}

export default PlayerActionView
