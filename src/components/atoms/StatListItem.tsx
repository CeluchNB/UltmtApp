import * as React from 'react'
import { DisplayStat } from '../../types/stats'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface StatListItemProps {
    stat: DisplayStat
}

const StatListItem: React.FC<StatListItemProps> = ({ stat }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const width = React.useMemo(() => {
        if (!stat || stat.points === 0 || stat.value === 0) {
            return 0
        }
        return 100 * (stat.value / stat.points)
    }, [stat])

    const styles = StyleSheet.create({
        container: {
            minWidth: 150,
        },
        statName: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
        },
        value: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            fontWeight: weight.bold,
        },
        ratioView: {
            width,
            backgroundColor: colors.textSecondary,
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
