import { Columns } from '../../types/stats'
import HeaderCell from '../atoms/HeaderCell'
import React from 'react'
import StatFilterChip from '../atoms/StatFilterChip'
import { getUserDisplayName } from '../../utils/player'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import {
    DEFENSE_COLUMNS,
    INVALID_COLUMNS,
    OFFENSE_COLUMNS,
    OVERALL_COLUMNS,
    PER_POINT_COLUMNS,
    calculateColumnTotals,
    formatNumber,
} from '../../utils/stats'
import { FilteredGamePlayer, PlayerStats } from '../../types/stats'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

interface StatsTableProps {
    players: FilteredGamePlayer[]
}

const StatsTable: React.FC<StatsTableProps> = ({ players }) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const navigation = useNavigation()

    const [sortColumn, setSortColumn] = React.useState('')
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
        'desc',
    )
    const [overallSelected, setOverallSelected] = React.useState(true)
    const [offenseSelected, setOffenseSelected] = React.useState(true)
    const [defenseSelected, setDefenseSelected] = React.useState(false)
    const [perPointSelected, setPerPointSelected] = React.useState(false)
    const scrollRef = React.useRef<ScrollView>(null)

    const sortByChosenColumn = React.useCallback(
        (columns: Columns) => {
            columns[sortColumn].sort((a, b) => {
                if (sortDirection === 'asc') {
                    return Number(a.value) - Number(b.value)
                } else {
                    return Number(b.value) - Number(a.value)
                }
            })
        },
        [sortColumn, sortDirection],
    )

    const sortColumnsToMatchChosenColumn = React.useCallback(
        (columns: Columns) => {
            for (const key of Object.keys(columns)) {
                if (key === sortColumn) continue
                columns[key].sort(
                    (a, b) =>
                        columns[sortColumn].findIndex(
                            ({ _id }) => _id === a._id,
                        ) -
                        columns[sortColumn].findIndex(
                            ({ _id }) => _id === b._id,
                        ),
                )
            }
        },
        [sortColumn],
    )

    const sortColumns = React.useCallback(
        (columns: Columns): Columns => {
            if (sortColumn === '') return columns

            sortByChosenColumn(columns)
            sortColumnsToMatchChosenColumn(columns)

            return columns
        },
        [sortByChosenColumn, sortColumn, sortColumnsToMatchChosenColumn],
    )

    const populateUserDisplayColumn = React.useCallback(
        (columns: Columns) => {
            columns.display = []
            for (const player of players) {
                columns.display.push({
                    _id: player.playerId ?? player._id,
                    value: getUserDisplayName(player),
                })
            }
        },
        [players],
    )

    const populateAllColumns = React.useCallback(
        (columns: Columns) => {
            const firstPlayer = players[0]
            for (const key in firstPlayer) {
                for (const player of players) {
                    if (!columns[key]) {
                        columns[key] = []
                    }
                    columns[key].push({
                        _id: player.playerId ?? player._id,
                        value: player[key as keyof PlayerStats],
                    })
                }
            }
        },
        [players],
    )

    const invalidColumn = (columnName: string): boolean => {
        if (INVALID_COLUMNS.includes(columnName)) {
            return true
        } else {
            if (overallSelected && OVERALL_COLUMNS.includes(columnName)) {
                return false
            }
            if (offenseSelected && OFFENSE_COLUMNS.includes(columnName)) {
                return false
            }
            if (defenseSelected && DEFENSE_COLUMNS.includes(columnName)) {
                return false
            }
            if (perPointSelected && PER_POINT_COLUMNS.includes(columnName)) {
                return false
            }
            return true
        }
    }

    const data = React.useMemo(() => {
        const columns: Columns = {}

        if (!players || players.length < 1) return {}

        populateUserDisplayColumn(columns)
        populateAllColumns(columns)

        return sortColumns(columns)
    }, [players, populateUserDisplayColumn, populateAllColumns, sortColumns])

    const totals = React.useMemo(() => {
        if (!data) return {}
        return calculateColumnTotals(data)
    }, [data])

    const getBackgroundColor = (idx: number): string => {
        return idx % 2 === 0 ? colors.primary : colors.darkPrimary
    }

    const toggleSort = (column: string) => {
        if (sortColumn !== column) {
            setSortColumn(column)
            setSortDirection('desc')
        } else if (sortColumn === column && sortDirection === 'desc') {
            setSortDirection('asc')
        } else {
            setSortColumn('')
            setSortDirection('desc')
        }
    }

    const styles = StyleSheet.create({
        table: { display: 'flex', flexDirection: 'row' },
        column: {
            maxWidth: 75,
            borderLeftColor: colors.darkPrimary,
            borderLeftWidth: 1,
        },
        titleCell: {
            margin: 10,
            height: 55,
            borderBottomColor: colors.textPrimary,
            borderBottomWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        title: {
            color: colors.textPrimary,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        valueCell: {
            height: 55,
            padding: 5,
            justifyContent: 'center',
        },
        valueText: {
            color: colors.textSecondary,
            textAlign: 'center',
            fontSize: size.fontTwenty,
        },
        playerCell: {
            textDecorationLine: 'underline',
            fontSize: size.fontFifteen,
        },
        totalCell: {
            borderTopColor: colors.textPrimary,
            borderTopWidth: 1,
        },
    })

    return (
        <View>
            <View style={styles.table}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <StatFilterChip
                        name="Overall"
                        selected={overallSelected}
                        onPress={() => {
                            setOverallSelected(curr => !curr)
                            scrollRef.current?.scrollTo({ x: 0, y: 0 })
                        }}
                    />
                    <StatFilterChip
                        name="Offense"
                        selected={offenseSelected}
                        onPress={() => {
                            setOffenseSelected(curr => !curr)
                            scrollRef.current?.scrollTo({ x: 0, y: 0 })
                        }}
                    />
                    <StatFilterChip
                        name="Defense"
                        selected={defenseSelected}
                        onPress={() => {
                            setDefenseSelected(curr => !curr)
                            scrollRef.current?.scrollTo({ x: 0, y: 0 })
                        }}
                    />
                    <StatFilterChip
                        name="Per Point"
                        selected={perPointSelected}
                        onPress={() => {
                            setPerPointSelected(curr => !curr)
                            scrollRef.current?.scrollTo({ x: 0, y: 0 })
                        }}
                    />
                </ScrollView>
            </View>
            <View style={styles.table}>
                {/* Sticky Player Column */}
                <View style={styles.column}>
                    <HeaderCell
                        value="Player"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onPress={() => {}}
                    />
                    {(data as Columns).display?.map((record, idx) => {
                        return (
                            <Pressable
                                key={`display_${record._id}`}
                                onPress={() => {
                                    navigation.navigate('PublicUserDetails', {
                                        userId: record._id,
                                    })
                                }}>
                                <Text
                                    testID="name-record"
                                    numberOfLines={2}
                                    style={[
                                        styles.valueCell,
                                        styles.valueText,
                                        styles.playerCell,
                                        {
                                            backgroundColor:
                                                getBackgroundColor(idx),
                                        },
                                    ]}>
                                    {record.value}
                                </Text>
                            </Pressable>
                        )
                    })}
                    <Text
                        testID="total-record"
                        numberOfLines={2}
                        style={[
                            styles.valueCell,
                            styles.valueText,
                            {
                                backgroundColor: getBackgroundColor(0),
                            },
                            styles.totalCell,
                        ]}>
                        Totals
                    </Text>
                </View>
                {/* Other columns */}
                <ScrollView horizontal ref={scrollRef}>
                    <View style={styles.table}>
                        {Object.entries(data).map(value => {
                            if (invalidColumn(value[0])) return null
                            return (
                                <View key={value[0]} style={styles.column}>
                                    <HeaderCell
                                        value={value[0]}
                                        sortColumn={sortColumn}
                                        sortDirection={sortDirection}
                                        onPress={() => toggleSort(value[0])}
                                    />
                                    {value[1].map((record, idx) => {
                                        return (
                                            <View
                                                key={`${value[0]}_${record._id}`}
                                                style={[
                                                    styles.valueCell,
                                                    {
                                                        backgroundColor:
                                                            getBackgroundColor(
                                                                idx,
                                                            ),
                                                    },
                                                ]}>
                                                <Text
                                                    numberOfLines={2}
                                                    style={styles.valueText}>
                                                    {formatNumber(
                                                        value[0],
                                                        record.value,
                                                    )}
                                                </Text>
                                            </View>
                                        )
                                    })}
                                    <Text
                                        key={`${value[0]}_total`}
                                        numberOfLines={2}
                                        style={[
                                            styles.valueText,
                                            styles.valueCell,
                                            {
                                                backgroundColor:
                                                    getBackgroundColor(
                                                        value[1].length,
                                                    ),
                                            },
                                            styles.totalCell,
                                        ]}>
                                        {formatNumber(
                                            value[0],
                                            totals[value[0]],
                                        )}
                                    </Text>
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default StatsTable
