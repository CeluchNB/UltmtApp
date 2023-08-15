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
    formatNumber,
} from '../../utils/stats'
import { FilteredGamePlayer, PlayerStats } from '../../types/stats'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

type Record = { _id: string; value: number | string }
type Columns = { [x: string]: Record[] }

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

    const populateDisplayColumn = React.useCallback(
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

    const data = React.useMemo(() => {
        const columns: Columns = {}

        if (!players || players.length < 1) return []

        populateDisplayColumn(columns)
        populateAllColumns(columns)

        return sortColumns(columns)
    }, [players, populateDisplayColumn, populateAllColumns, sortColumns])

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
            color: colors.textSecondary,
            textAlign: 'center',
            textAlignVertical: 'center',
            height: 50,
            padding: 5,
            fontSize: size.fontTwenty,
        },
        playerCell: {
            textDecorationLine: 'underline',
            fontSize: size.fontFifteen,
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
                                    navigation.navigate('Tabs', {
                                        screen: 'Account',
                                        params: {
                                            screen: 'PublicUserDetails',
                                            params: {
                                                userId: record._id,
                                            },
                                            initial: false,
                                        },
                                    })
                                }}>
                                <Text
                                    testID="name-record"
                                    numberOfLines={2}
                                    style={[
                                        styles.valueCell,
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
                                            <Text
                                                key={`${value[0]}_${record._id}`}
                                                numberOfLines={2}
                                                style={[
                                                    styles.valueCell,
                                                    {
                                                        backgroundColor:
                                                            getBackgroundColor(
                                                                idx,
                                                            ),
                                                    },
                                                ]}>
                                                {formatNumber(
                                                    value[0],
                                                    record.value,
                                                )}
                                            </Text>
                                        )
                                    })}
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
