import { DisplayUser } from '../../types/user'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface LeaderListItemProps {
    leader: {
        title: string
        player?: DisplayUser
        total?: number
    }
}

const LeaderListItem: React.FC<LeaderListItemProps> = ({
    leader: { title, player, total },
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            margin: 5,
        },
        button: {
            width: '50%',
            alignSelf: 'flex-end',
            margin: 5,
        },
        title: {
            color: colors.gray,
            fontSize: size.fontFifteen,
        },
        nameContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        name: {
            flex: 1,
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
        },
        total: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
        },
    })
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.nameContainer}>
                <Text style={styles.name}>
                    {player?.firstName} {player?.lastName}
                </Text>
                <Text style={styles.total}>{total}</Text>
            </View>
        </View>
    )
}

export default LeaderListItem
