import { DisplayUser } from '../../types/user'
import React from 'react'
import { getUserDisplayName } from '../../utils/player'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface SmallLeaderListItemProps {
    leader: {
        title: string
        player?: DisplayUser
        total?: number
    }
}

const SmallLeaderListItem: React.FC<SmallLeaderListItemProps> = ({
    leader: { title, player, total },
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
            size: size.fontTwenty,
        },
        playerUsername: {
            alignSelf: 'flex-start',
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
        },
    })
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.total}>{total}</Text>
            <Text style={styles.playerName}>{getUserDisplayName(player)}</Text>
            <Text style={styles.playerUsername}>@{player?.username}</Text>
        </View>
    )
}

export default SmallLeaderListItem