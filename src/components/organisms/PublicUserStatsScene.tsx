import { AllPlayerStats } from '../../types/stats'
import { DataTable } from 'react-native-paper'
import { DisplayTeam } from '../../types/team'
import { DisplayUser } from '../../types/user'
import { Game } from '../../types/game'
import GameListItem from '../atoms/GameListItem'
import PlayerConnectionsView from './PlayerConnectionsView'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import TeamListItem from '../atoms/TeamListItem'
import UserStatsPieChart from '../atoms/UserStatsPieChart'
import { getFilterButtonText } from '../../utils/player'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import StatsFilterModal, { CheckBoxItem } from '../molecules/StatsFilterModal'
import { filterPlayerStats, getPlayerStats } from './../../services/data/stats'
import {
    formatNumber,
    mapStatDisplayName,
    sortAlphabetically,
} from '../../utils/stats'

export interface PublicUserStatsSceneProps {
    userId: string
    teams: DisplayTeam[]
    teammates: DisplayUser[]
    games: { game: Game; teamId: string }[]
}

const PublicUserStatsScene: React.FC<PublicUserStatsSceneProps> = ({
    userId,
    teams,
    teammates,
    games,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const [teamFilterVisible, setTeamFilterVisible] = React.useState(false)
    const [gameFilterVisible, setGameFilterVisible] = React.useState(false)
    const [availableGames, setAvailableGames] = React.useState<string[]>([])
    const [teamFilterOptions, setTeamFilterOptions] = React.useState<
        CheckBoxItem[]
    >([])
    const [gameFilterOptions, setGameFilterOptions] = React.useState<
        CheckBoxItem[]
    >([])
    const [teamFilterIds, setTeamFilterIds] = React.useState<string[]>([])
    const [gameFilterIds, setGameFilterIds] = React.useState<string[]>([])

    const filteredStatsEnabled = React.useMemo(() => {
        return teamFilterIds.length > 0 || gameFilterIds.length > 0
    }, [teamFilterIds, gameFilterIds])

    const totalStatsEnabled = React.useMemo(() => {
        return teamFilterIds.length === 0 && gameFilterIds.length === 0
    }, [teamFilterIds, gameFilterIds])

    const {
        data: filteredStatsData,
        isLoading: filterLoading,
        refetch: filterRefetch,
    } = useQuery(
        ['filterPlayerStats', { userId, teamFilterIds, gameFilterIds }],
        () => filterPlayerStats(userId, teamFilterIds, gameFilterIds),
        { enabled: filteredStatsEnabled },
    )

    const {
        data: totalStatsData,
        isLoading: totalLoading,
        refetch: totalRefetch,
    } = useQuery(['getPlayerStats', { userId }], () => getPlayerStats(userId), {
        enabled: totalStatsEnabled,
        onSuccess(data) {
            setAvailableGames(data.games)
        },
    })

    const stats = React.useMemo(() => {
        if (filteredStatsEnabled) return filteredStatsData
        if (totalStatsEnabled) return totalStatsData
    }, [
        filteredStatsData,
        totalStatsData,
        filteredStatsEnabled,
        totalStatsEnabled,
    ])

    const loading = React.useMemo(() => {
        return filterLoading || totalLoading
    }, [filterLoading, totalLoading])

    const connectionOptions = React.useMemo(() => {
        return teammates.map(value => ({ ...value, playerId: value._id }))
    }, [teammates])

    React.useEffect(() => {
        setTeamFilterOptions(
            teams.map(team => ({
                display: <TeamListItem team={team} />,
                value: team._id,
                checked: false,
            })),
        )
    }, [teams])

    React.useEffect(() => {
        const tempGames = games.filter(
            g =>
                availableGames.length === 0 ||
                availableGames.includes(g.game._id),
        )
        setGameFilterOptions(
            tempGames.map(({ game, teamId }) => ({
                display: <GameListItem game={game} teamId={teamId} />,
                value: game._id,
                checked: false,
            })),
        )
    }, [games, availableGames])

    const setFilters = () => {
        const teamFilter = teamFilterOptions
            .filter(value => value.checked)
            .map(value => value.value)
        const gameFilter = gameFilterOptions
            .filter(value => value.checked)
            .map(value => value.value)

        setTeamFilterIds(teamFilter)
        setGameFilterIds(gameFilter)

        setTeamFilterVisible(false)
        setGameFilterVisible(false)
    }

    const filteredStats = React.useMemo(() => {
        if (!stats) return undefined

        const updatedStats: Partial<AllPlayerStats> = Object.assign({}, stats)

        // TODO: this is not ideal, at least move it to a separate function
        delete (updatedStats as any)._id
        delete (updatedStats as any).games
        delete (updatedStats as any).teams
        delete (updatedStats as any).firstName
        delete (updatedStats as any).lastName
        delete (updatedStats as any).username
        delete (updatedStats as any).__v
        delete (updatedStats as any).id
        delete (updatedStats as any).playerId
        delete (updatedStats as any).gameId
        delete (updatedStats as any).teamId

        return updatedStats
    }, [stats])

    const onTeamSelect = (teamId: string) => {
        setTeamFilterOptions(curr => {
            return curr.map(value => {
                if (value.value === teamId) {
                    return { ...value, checked: !value.checked }
                }
                return value
            })
        })
    }

    const onTeamClear = () => {
        setTeamFilterOptions(curr => {
            return curr.map(value => ({ ...value, checked: false }))
        })
    }

    const onGameSelect = (gameId: string) => {
        setGameFilterOptions(curr => {
            return curr.map(value => {
                if (value.value === gameId) {
                    return { ...value, checked: !value.checked }
                }
                return value
            })
        })
    }

    const onGameClear = () => {
        setGameFilterOptions(curr => {
            return curr.map(value => ({ ...value, checked: false }))
        })
    }

    const styles = StyleSheet.create({
        titleCell: {
            color: colors.textPrimary,
        },
        valueCell: {
            color: colors.textSecondary,
        },
        container: {
            padding: 5,
        },
        buttonContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignSelf: 'center',
            width: '100%',
            justifyContent: 'space-evenly',
        },
        error: {
            alignSelf: 'center',
            fontSize: size.fontThirty,
            color: colors.gray,
        },
    })

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    colors={[colors.textSecondary]}
                    tintColor={colors.textSecondary}
                    onRefresh={() => {
                        if (filteredStatsEnabled) {
                            filterRefetch()
                        }
                        if (totalStatsEnabled) {
                            totalRefetch()
                        }
                    }}
                />
            }
            testID="public-user-stats-scroll-view">
            <View style={styles.buttonContainer}>
                <SecondaryButton
                    text={getFilterButtonText('Team', teamFilterOptions)}
                    onPress={async () => {
                        setTeamFilterVisible(true)
                    }}
                />
                <SecondaryButton
                    text={getFilterButtonText('Game', gameFilterOptions)}
                    onPress={async () => {
                        setGameFilterVisible(true)
                    }}
                />
            </View>
            {loading && (
                <ActivityIndicator color={colors.textPrimary} size="large" />
            )}
            {!loading && !filteredStats && (
                <Text style={styles.error}>
                    Could not get stats for this user
                </Text>
            )}
            {!loading && filteredStats && (
                <View style={styles.container}>
                    <UserStatsPieChart
                        goals={filteredStats.goals}
                        assists={filteredStats.assists}
                        blocks={filteredStats.blocks}
                        throwaways={filteredStats.throwaways}
                    />
                    <PlayerConnectionsView
                        games={gameFilterIds}
                        teams={teamFilterIds}
                        throwerId={userId}
                        players={connectionOptions}
                    />
                    <DataTable>
                        {filteredStats &&
                            Object.entries(filteredStats)
                                .sort((a, b) => sortAlphabetically(a[0], b[0]))
                                .map(([key, value]) => {
                                    return (
                                        <DataTable.Row key={key}>
                                            <DataTable.Cell
                                                textStyle={styles.titleCell}>
                                                {mapStatDisplayName(key)}
                                            </DataTable.Cell>
                                            <DataTable.Cell
                                                textStyle={styles.valueCell}>
                                                {formatNumber(
                                                    key,
                                                    value.toString(),
                                                )}
                                            </DataTable.Cell>
                                        </DataTable.Row>
                                    )
                                })}
                    </DataTable>
                </View>
            )}
            <StatsFilterModal
                visible={teamFilterVisible}
                onSelect={onTeamSelect}
                onClear={onTeamClear}
                onDone={setFilters}
                title="Teams"
                data={teamFilterOptions}
            />
            <StatsFilterModal
                visible={gameFilterVisible}
                onSelect={onGameSelect}
                onClear={onGameClear}
                onDone={setFilters}
                title="Games"
                data={gameFilterOptions}
            />
        </ScrollView>
    )
}

export default PublicUserStatsScene
