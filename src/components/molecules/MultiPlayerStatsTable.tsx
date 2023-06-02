import { Chip } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import React from 'react'
import { getUserDisplayName } from '../../utils/player'
import { mapStatDisplayName } from '../../utils/stats'
import { useTheme } from '../../hooks'
import { FilteredGameStats, PlayerStats } from '../../types/stats'
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

const INVALID_COLUMNS = [
    'display',
    'firstName',
    'lastName',
    '_id',
    'username',
    'games',
    'teams',
    '__v',
    'id',
    'teamId',
    'gameId',
    'playerId',
    'wins',
    'losses',
]

const OVERALL_COLUMNS = [
    'plusMinus',
    'pointsPlayed',
    'catchingPercentage',
    'throwingPercentage',
]
const OFFENSE_COLUMNS = [
    'goals',
    'assists',
    'touches',
    'completions',
    'throwaways',
    'drops',
    'stalls',
    'catches',
    'completedPasses',
    'droppedPasses',
]
const DEFENSE_COLUMNS = ['blocks', 'pulls', 'callahans']
const PER_POINT_COLUMNS = [
    'ppGoals',
    'ppAssists',
    'ppThrowaways',
    'ppDrops',
    'ppBlocks',
    'pointsPlayed',
]

interface MultiPlayerStatsTableProps {
    stats: FilteredGameStats
}

const MultiPlayerStatsTable: React.FC<MultiPlayerStatsTableProps> = ({
    stats,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const [sortColumn, setSortColumn] = React.useState('')
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>(
        'desc',
    )
    const [overallSelected, setOverallSelected] = React.useState(true)
    const [offenseSelected, setOffenseSelected] = React.useState(true)
    const [defenseSelected, setDefenseSelected] = React.useState(false)
    const [perPointSelected, setPerPointSelected] = React.useState(false)
    const scrollRef = React.useRef<ScrollView>(null)

    const sortColumns = React.useCallback(
        (columns: {
            [x: string]: { _id: string; value: number | string }[]
        }): {
            [x: string]: { _id: string; value: number | string }[]
        } => {
            if (sortColumn === '') return columns

            columns[sortColumn].sort((a, b) => {
                if (sortDirection === 'asc') {
                    return Number(a.value) - Number(b.value)
                } else {
                    return Number(b.value) - Number(a.value)
                }
            })

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
            return columns
        },
        [sortColumn, sortDirection],
    )

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

        return sortColumns(columns)
    }, [stats, sortColumns])

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

    const displaySortArrow = (column: string): boolean => {
        return column === sortColumn
    }

    const displayUpSortArrow = (
        column: string,
    ): { display: 'none' | 'flex' } => {
        return {
            display:
                displaySortArrow(column) && sortDirection === 'asc'
                    ? 'flex'
                    : 'none',
        }
    }

    const displayDownSortArrow = (
        column: string,
    ): { display: 'none' | 'flex' } => {
        return {
            display:
                displaySortArrow(column) && sortDirection === 'desc'
                    ? 'flex'
                    : 'none',
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
        },
    })

    return (
        <View>
            <View style={styles.table}>
                <Chip
                    mode="outlined"
                    textStyle={{
                        color: overallSelected
                            ? colors.primary
                            : colors.textPrimary,
                    }}
                    style={{
                        backgroundColor: overallSelected
                            ? colors.textPrimary
                            : colors.primary,
                        borderColor: colors.textPrimary,
                    }}
                    onPress={() => {
                        setOverallSelected(curr => !curr)
                        scrollRef.current?.scrollTo({ x: 0, y: 0 })
                    }}>
                    Overall
                </Chip>
                <Chip
                    mode="outlined"
                    textStyle={{
                        color: offenseSelected
                            ? colors.primary
                            : colors.textPrimary,
                    }}
                    style={{
                        backgroundColor: offenseSelected
                            ? colors.textPrimary
                            : colors.primary,
                        borderColor: colors.textPrimary,
                    }}
                    onPress={() => {
                        setOffenseSelected(curr => !curr)
                        scrollRef.current?.scrollTo({ x: 0, y: 0 })
                    }}>
                    Offense
                </Chip>
                <Chip
                    mode="outlined"
                    textStyle={{
                        color: defenseSelected
                            ? colors.primary
                            : colors.textPrimary,
                    }}
                    style={{
                        backgroundColor: defenseSelected
                            ? colors.textPrimary
                            : colors.primary,
                        borderColor: colors.textPrimary,
                    }}
                    onPress={() => {
                        setDefenseSelected(curr => !curr)
                        scrollRef.current?.scrollTo({ x: 0, y: 0 })
                    }}>
                    Defense
                </Chip>
                <Chip
                    mode="outlined"
                    textStyle={{
                        color: perPointSelected
                            ? colors.primary
                            : colors.textPrimary,
                    }}
                    style={{
                        backgroundColor: perPointSelected
                            ? colors.textPrimary
                            : colors.primary,
                        borderColor: colors.textPrimary,
                    }}
                    onPress={() => {
                        setPerPointSelected(curr => !curr)
                        scrollRef.current?.scrollTo({ x: 0, y: 0 })
                    }}>
                    Per Point
                </Chip>
            </View>
            <View style={styles.table}>
                {/* Sticky Player Column */}
                <View style={styles.column}>
                    <Text style={[styles.titleCell, styles.title]}>Player</Text>
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
                                        backgroundColor:
                                            getBackgroundColor(idx),
                                    },
                                ]}>
                                {record.value}
                            </Text>
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
                                    <TouchableOpacity
                                        style={styles.titleCell}
                                        onPress={() => toggleSort(value[0])}>
                                        <Icon
                                            name="chevron-up"
                                            color={colors.textPrimary}
                                            style={displayUpSortArrow(value[0])}
                                        />
                                        <Text
                                            numberOfLines={2}
                                            style={styles.title}>
                                            {mapStatDisplayName(value[0])}
                                        </Text>
                                        <Icon
                                            name="chevron-down"
                                            color={colors.textPrimary}
                                            style={displayDownSortArrow(
                                                value[0],
                                            )}
                                        />
                                    </TouchableOpacity>
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
        </View>
    )
}

export default MultiPlayerStatsTable
