import { ActionType } from '../../types/action'
import { GuestUser } from '../../types/user'
import { IconButton } from 'react-native-paper'
import PlayerActionItem from '../molecules/PlayerActionItem'
import React from 'react'
import { getPlayerValidActions } from '../../utils/actions'
import { useColors } from '../../hooks'
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native'

interface PlayerActionViewProps {
    players: GuestUser[]
    pulling: boolean
    prevAction?: ActionType | 'score'
    activePlayer?: number
    undoDisabled: boolean
    loading: boolean
    error?: string
    onAction: (
        index: number,
        action: ActionType | 'score',
        tags: string[],
    ) => void
    onUndo: () => void
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
    undoDisabled,
    loading,
    error,
    onAction,
    onUndo,
}) => {
    const { colors } = useColors()
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

    const onPress = (
        index: number,
        action: ActionType | 'score',
        tags: string[],
    ) => {
        onAction(index, action, tags)
    }

    const styles = StyleSheet.create({
        headerContainer: {
            flexDirection: 'row',
            alignSelf: 'flex-end',
        },
        error: {
            color: colors.error,
            width: '80%',
        },
    })

    return (
        <View>
            <View style={styles.headerContainer}>
                <Text style={styles.error}>{error}</Text>
                {!error && loading && (
                    <ActivityIndicator
                        color={colors.textPrimary}
                        size="small"
                    />
                )}
                <IconButton
                    icon="undo"
                    color={colors.textPrimary}
                    onPress={onUndo}
                    disabled={undoDisabled}
                    testID="undo-button"
                />
            </View>
            <FlatList
                data={playerActions}
                renderItem={({ item, index }) => {
                    const { player, actions } = item
                    return (
                        <PlayerActionItem
                            key={index}
                            player={player}
                            actions={actions}
                            onAction={(action, tags) => {
                                onPress(index, action, tags)
                            }}
                        />
                    )
                }}
            />
        </View>
    )
}

export default PlayerActionView
