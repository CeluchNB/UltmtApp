import { PlayerIdUser } from '../../types/stats'
import React from 'react'
import { getUserDisplayName } from '../../utils/player'
import { useTheme } from '../../hooks'
import { Pressable, StyleSheet, Text } from 'react-native'

interface SmallLeaderListItemProps {
    leader: {
        title: string
        player?: PlayerIdUser
        total?: number | string
    }
    onPress?: (player?: PlayerIdUser) => void
}

const SmallLeaderListItem: React.FC<SmallLeaderListItemProps> = ({
    leader: { title, player, total },
    onPress,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            alignItems: 'center',
            margin: 10,
        },
        title: {
            color: colors.gray,
            fontSize: size.fontTwenty,
        },
        total: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
        },
        playerName: {
            alignSelf: 'flex-start',
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
        },
        playerUsername: {
            alignSelf: 'flex-start',
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
        },
    })

    return (
        <Pressable
            style={styles.container}
            onPress={() => {
                if (onPress) onPress(player)
            }}>
            <Text style={styles.title}>{title}</Text>
            {total !== undefined && total !== null && (
                <Text style={styles.total}>{total}</Text>
            )}
            {player && (
                <Text style={styles.playerName}>
                    {getUserDisplayName(player)}
                </Text>
            )}
            {player && (
                <Text style={styles.playerUsername}>@{player?.username}</Text>
            )}
        </Pressable>
    )
}

export default SmallLeaderListItem
