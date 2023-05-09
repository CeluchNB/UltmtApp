import * as StatsData from './../../services/data/stats'
import { AllPlayerStats } from '../../types/stats'
import { ApiError } from '../../types/services'
import { DataTable } from 'react-native-paper'
import { DisplayTeam } from '../../types/team'
import { Game } from '../../types/game'
import GameListItem from '../atoms/GameListItem'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import TeamListItem from '../atoms/TeamListItem'
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
import { formatNumber, mapStatDisplayName } from '../../utils/stats'

export interface PublicUserStatsSceneProps {
    userId: string
    teams: DisplayTeam[]
    games: { game: Game; teamId: string }[]
}

const PublicUserStatsScene: React.FC<PublicUserStatsSceneProps> = ({
    userId,
    teams,
    games,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const [teamFilterVisible, setTeamFilterVisible] = React.useState(false)
    const [gameFilterVisible, setGameFilterVisible] = React.useState(false)
    const [stats, setStats] = React.useState<AllPlayerStats>()
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<ApiError | undefined>(undefined)
    const [teamFilterOptions, setTeamFilterOptions] = React.useState<
        CheckBoxItem[]
    >([])
    const [gameFilterOptions, setGameFilterOptions] = React.useState<
        CheckBoxItem[]
    >([])

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
        setGameFilterOptions(
            games.map(({ game, teamId }) => ({
                display: <GameListItem game={game} teamId={teamId} />,
                value: game._id,
                checked: false,
            })),
        )
    }, [games])

    const getStats = () => {
        setLoading(true)
        setError(undefined)
        const teamFilter = teamFilterOptions
            .filter(value => value.checked)
            .map(value => value.value)
        const gameFilter = gameFilterOptions
            .filter(value => value.checked)
            .map(value => value.value)
        if (teamFilter.length > 0 || gameFilter.length > 0) {
            StatsData.filterPlayerStats(userId, teamFilter, gameFilter)
                .then(result => {
                    setStats(result)
                })
                .catch(e => {
                    setError(e)
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            StatsData.getPlayerStats(userId)
                .then(result => {
                    setStats(result)
                })
                .catch(e => {
                    setError(e)
                })
                .finally(() => {
                    setLoading(false)
                })
        }
        setTeamFilterVisible(false)
        setGameFilterVisible(false)
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
        button: {
            flexGrow: 1,
        },
        buttonContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        error: {
            color: colors.gray,
            fontSize: size.fontThirty,
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
            {loading && (
                <ActivityIndicator color={colors.textPrimary} size="large" />
            )}
            {error && <Text style={styles.error}>{error.message}</Text>}
            {!loading && !error && (
                <View>
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
                onSelect={onTeamSelect}
                onClear={onTeamClear}
                onDone={getStats}
                title="Teams"
                data={teamFilterOptions}
            />
            <StatsFilterModal
                visible={gameFilterVisible}
                onSelect={onGameSelect}
                onClear={onGameClear}
                onDone={getStats}
                title="Games"
                data={gameFilterOptions}
            />
        </ScrollView>
    )
}

export default PublicUserStatsScene
