import React from 'react'
import { useTheme } from '../../hooks'
import { AllPlayerStats, GameStats, PlayerStats } from '../../types/stats'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
    addPlayerStats,
    calculatePlayerStats,
    mapStatDisplayName,
} from '../../utils/stats'

interface MultiPlayerStatsTableProps {
    stats: GameStats
}

const MultiPlayerStatsTable: React.FC<MultiPlayerStatsTableProps> = ({
    stats,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const data = React.useMemo(() => {
        const playerMap = new Map<string, AllPlayerStats>()
        for (const point of stats.points) {
            for (const player of point.players) {
                const current = playerMap.get(player._id)
                if (current) {
                    const playerStats = addPlayerStats(current, player)
                    playerMap.set(player._id, {
                        ...playerStats,
                        ...calculatePlayerStats(playerStats),
                    })
                } else {
                    playerMap.set(player._id, {
                        ...player,
                        ...calculatePlayerStats(player),
                    })
                }
            }
        }

        const columns: {
            [x: string]: { _id: string; value: number | string }[]
        } = {}

        const firstPlayer = playerMap.get(stats.points[0].players[0]._id)
        if (!firstPlayer) return []

        for (const key in firstPlayer) {
            for (const entry of playerMap.entries()) {
                if (!columns[key]) {
                    columns[key] = []
                }
                columns[key].push({
                    _id: entry[0],
                    value: entry[1][key as keyof PlayerStats],
                })
            }
        }
        return columns
    }, [stats])

    const styles = StyleSheet.create({
        table: { display: 'flex', flexDirection: 'row' },
        column: {
            maxWidth: 75,
            borderLeftColor: colors.darkPrimary,
            borderLeftWidth: 1,
        },
        titleCell: {
            color: colors.textPrimary,
            textAlign: 'center',
            margin: 10,
            height: 50,
            borderBottomColor: colors.textPrimary,
            borderBottomWidth: 1,
        },
        valueCell: {
            color: colors.textSecondary,
            textAlign: 'center',
            borderBottomColor: colors.darkPrimary,
            borderBottomWidth: 1,
            margin: 5,
        },
        cell: {
            borderLeftWidth: 1,
            borderLeftColor: colors.gray,
            justifyContent: 'center',
            textAlign: 'center',
            borderBottomColor: colors.darkPrimary,
            borderBottomWidth: 1,
        },
    })

    return (
        <View style={styles.table}>
            <View style={styles.column}>
                <Text style={styles.titleCell}>Player</Text>
                {(
                    data as {
                        [x: string]: { _id: string; value: number | string }[]
                    }
                ).wins.map(record => {
                    return <Text style={styles.valueCell}>{record.value}</Text>
                })}
            </View>
            <ScrollView horizontal>
                <View style={styles.table}>
                    {Object.entries(data).map(value => {
                        return (
                            <View style={styles.column}>
                                <Text style={styles.titleCell}>
                                    {mapStatDisplayName(value[0])}
                                </Text>
                                {value[1].map(record => {
                                    return (
                                        <Text style={styles.valueCell}>
                                            {record.value}
                                        </Text>
                                    )
                                })}
                            </View>
                        )
                    })}
                </View>
            </ScrollView>
        </View>
    )
}

export default MultiPlayerStatsTable
