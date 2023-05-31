import React from 'react'
import { getUserDisplayName } from '../../utils/player'
import { mapStatDisplayName } from '../../utils/stats'
import { useTheme } from '../../hooks'
import { FilteredGameStats, PlayerStats } from '../../types/stats'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

interface MultiPlayerStatsTableProps {
    stats: FilteredGameStats
}

const MultiPlayerStatsTable: React.FC<MultiPlayerStatsTableProps> = ({
    stats,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const data = React.useMemo(() => {
        const columns: {
            [x: string]: { _id: string; value: number | string }[]
        } = {}

        if (!stats || stats?.players.length < 1) return []

        columns.display = []
        for (const player of stats.players) {
            columns.display.push({
                _id: player._id,
                value: getUserDisplayName(player),
            })
        }

        const firstPlayer = stats.players[0]
        delete (firstPlayer as any).firstName
        delete (firstPlayer as any).lastName
        delete (firstPlayer as any).username
        delete (firstPlayer as any)._id
        delete (firstPlayer as any).games
        delete (firstPlayer as any).teams
        delete (firstPlayer as any).__v
        delete (firstPlayer as any).id
        delete (firstPlayer as any).teamId
        delete (firstPlayer as any).gameId
        delete (firstPlayer as any).playerId

        for (const key in firstPlayer) {
            for (const player of stats.players) {
                if (!columns[key]) {
                    columns[key] = []
                }
                columns[key].push({
                    _id: player._id,
                    value: player[key as keyof PlayerStats],
                })
            }
        }

        return columns
    }, [stats])

    const getBackgroundColor = (idx: number): string => {
        return idx % 2 === 0 ? colors.primary : colors.darkPrimary
    }

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
            textAlignVertical: 'center',
            margin: 10,
            height: 55,
            borderBottomColor: colors.textPrimary,
            borderBottomWidth: 1,
        },
        valueCell: {
            color: colors.textSecondary,
            textAlign: 'center',
            textAlignVertical: 'center',
            height: 50,
            padding: 5,
        },
    })

    return (
        <View style={styles.table}>
            {/* Sticky Player Column */}
            <View style={styles.column}>
                <Text style={styles.titleCell}>Player</Text>
                {(
                    data as {
                        [x: string]: {
                            _id: string
                            value: number | string
                        }[]
                    }
                ).display?.map((record, idx) => {
                    return (
                        <Text
                            key={`display_${record._id}`}
                            numberOfLines={2}
                            style={[
                                styles.valueCell,
                                {
                                    backgroundColor: getBackgroundColor(idx),
                                },
                            ]}>
                            {record.value}
                        </Text>
                    )
                })}
            </View>
            <ScrollView horizontal>
                <View style={styles.table}>
                    {Object.entries(data).map(value => {
                        if (value[0] === 'display') return null
                        return (
                            <View key={value[0]} style={styles.column}>
                                <Text
                                    style={styles.titleCell}
                                    numberOfLines={3}>
                                    {mapStatDisplayName(value[0])}
                                </Text>
                                {value[1].map((record, idx) => {
                                    return (
                                        <Text
                                            key={`${value[0]}_${record._id}`}
                                            numberOfLines={2}
                                            style={[
                                                styles.valueCell,
                                                {
                                                    backgroundColor:
                                                        getBackgroundColor(idx),
                                                },
                                            ]}>
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
