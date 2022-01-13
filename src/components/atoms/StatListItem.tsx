import * as React from 'react'
import { DisplayStat } from '../../types/stats'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface StatListItemProps {
    stat: DisplayStat
}

const StatListItem: React.FC<StatListItemProps> = ({ stat }) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            minWidth: 150,
        },
        statName: {
            color: colors.gray,
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
        },
        value: {
            color: colors.textPrimary,
            fontSize: size.fontLarge,
            fontWeight: weight.bold,
        },
        ratioView: {
            backgroundColor: colors.textSecondary,
            width: 100 * (Math.min(stat.value + 50, stat.points) / stat.points),
            height: 10,
            borderRadius: 5,
        },
    })

    return (
        <View style={styles.container}>
            <Text style={styles.statName}>{stat.name}</Text>
            <Text style={styles.value}>{stat.value}</Text>
            <View style={styles.ratioView} />
        </View>
    )
}

export default StatListItem
