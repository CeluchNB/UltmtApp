import * as StatsData from './../../services/data/stats'
import { AllPlayerStats } from '../../types/stats'
import { DataTable } from 'react-native-paper'
import { DisplayTeam } from '../../types/team'
import { Game } from '../../types/game'
import GameListItem from '../atoms/GameListItem'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import StatsFilterModal from '../molecules/StatsFilterModal'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native'
import { formatNumber, mapStatDisplayName } from '../../utils/stats'

export interface PublicUserStatsSceneProps {
    userId: string
    teams: DisplayTeam[]
    games: Game[]
}

const PublicUserStatsScene: React.FC<PublicUserStatsSceneProps> = ({
    userId,
    teams,
    games,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const [teamFilterVisible, setTeamFilterVisible] = React.useState(false)
    const [gameFilterVisible, setGameFilterVisible] = React.useState(false)
    const [stats, setStats] = React.useState<AllPlayerStats>()
    const [loading, setLoading] = React.useState(false)
    const [teamFilter, setTeamFilter] = React.useState<string[]>([])
    const [gameFilter, setGameFilter] = React.useState<string[]>([])

    const getStats = () => {
        setLoading(true)
        if (teamFilter.length > 0 || gameFilter.length > 0) {
            StatsData.filterPlayerStats(userId, teamFilter, gameFilter)
                .then(result => {
                    setStats(result)
                })
                .catch(_e => {})
                .finally(() => {
                    setLoading(false)
                })
        } else {
            StatsData.getPlayerStats(userId)
                .then(result => {
                    setStats(result)
                })
                .catch(_e => {})
                .finally(() => {
                    setLoading(false)
                })
        }
    }

    React.useEffect(() => {
        getStats()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const filteredStats = React.useMemo(() => {
        const updatedStats: Partial<AllPlayerStats> = Object.assign({}, stats)

        delete (updatedStats as any)._id
        delete (updatedStats as any).games
        delete (updatedStats as any).teams
        delete (updatedStats as any).firstName
        delete (updatedStats as any).lastName
        delete (updatedStats as any).username
        delete (updatedStats as any).__v
        delete (updatedStats as any).id

        return updatedStats
    }, [stats])

    const formatTeamName = (team: DisplayTeam): string => {
        const teamStart = new Date(team.seasonStart).getUTCFullYear()
        const teamEnd = new Date(team.seasonEnd).getUTCFullYear()
        if (teamStart === teamEnd) {
            return `${team.name} (${teamStart})`
        }
        return `${team.name} (${teamStart} - ${teamEnd})`
    }

    const updateTeamFilters = (teamFilters: string[]) => {
        setTeamFilter(teamFilters)
        setTeamFilterVisible(false)
    }

    const updateGameFilters = (gameFilters: string[]) => {
        setGameFilter(gameFilters)
        setGameFilterVisible(false)
    }

    const styles = StyleSheet.create({
        titleCell: {
            color: colors.textPrimary,
        },
        valueCell: {
            color: colors.textSecondary,
        },
        button: {
            flexGrow: 1,
        },
        buttonContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        error: {
            color: colors.error,
            width: '80%',
            alignSelf: 'center',
        },
    })

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={() => {
                        getStats()
                    }}
                />
            }
            testID="public-user-stats-scroll-view">
            {loading && (
                <ActivityIndicator color={colors.textPrimary} size="large" />
            )}
            {/* {error && <Text style={styles.error}>{error.message}</Text>} */}
            {!loading /*&& !error*/ && (
                <View>
                    <View style={styles.buttonContainer}>
                        <SecondaryButton
                            style={styles.button}
                            text="Filter by Team"
                            onPress={async () => {
                                setTeamFilterVisible(true)
                            }}
                        />
                        <SecondaryButton
                            style={styles.button}
                            text="Filter by Game"
                            onPress={async () => {
                                setGameFilterVisible(true)
                            }}
                        />
                    </View>
                    <DataTable>
                        {stats &&
                            Object.entries(filteredStats).map(
                                ([key, value]) => {
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
                                },
                            )}
                    </DataTable>
                </View>
            )}
            <StatsFilterModal
                visible={teamFilterVisible}
                onClose={updateTeamFilters}
                title="Teams"
                data={teams.map(team => ({
                    display: formatTeamName(team),
                    value: team._id,
                }))}
            />
            <StatsFilterModal
                visible={gameFilterVisible}
                onClose={updateGameFilters}
                title="Games"
                data={games.map(game => ({
                    // TODO: teamId is currently the wrong value
                    display: (
                        <GameListItem game={game} teamId={game.teamOne._id} />
                    ),
                    value: game._id,
                }))}
            />
        </ScrollView>
    )
}

export default PublicUserStatsScene
