import * as StatsData from './../../services/data/stats'
import { DataTable } from 'react-native-paper'
import { DisplayTeam } from '../../types/team'
import { PlayerStats } from '../../types/stats'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import StatsFilterModal from '../molecules/StatsFilterModal'
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { formatNumber, mapStatDisplayName } from '../../utils/stats'
import { useData, useTheme } from '../../hooks'

export interface PublicUserStatsSceneProps {
    userId: string
    teams: DisplayTeam[]
}

const PublicUserStatsScene: React.FC<PublicUserStatsSceneProps> = ({
    userId,
    teams,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const [modalVisible, setModalVisible] = React.useState(false)

    const {
        data: stats,
        loading,
        error,
        refetch,
    } = useData<PlayerStats>(StatsData.getPlayerStats, userId)

    const filteredStats = React.useMemo(() => {
        const updatedStats: Partial<PlayerStats> = Object.assign({}, stats)
        delete updatedStats._id
        delete updatedStats.games
        delete updatedStats.teams
        delete updatedStats.firstName
        delete updatedStats.lastName
        delete updatedStats.username
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

    const filterStats = async () => {
        await StatsData.filterPlayerStats(userId, [teams[0]._id], [])
        setModalVisible(false)
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
                        refetch()
                    }}
                />
            }
            testID="public-user-stats-scroll-view">
            {loading && (
                <ActivityIndicator color={colors.textPrimary} size="large" />
            )}
            {error && <Text style={styles.error}>{error.message}</Text>}
            {!loading && !error && (
                <View>
                    <View style={styles.buttonContainer}>
                        <SecondaryButton
                            style={styles.button}
                            text="Filter by Team"
                            onPress={async () => {
                                setModalVisible(true)
                            }}
                        />
                        <SecondaryButton
                            style={styles.button}
                            text="Filter by Game"
                            onPress={async () => {
                                setModalVisible(true)
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
                visible={modalVisible}
                onClose={filterStats}
                title="Teams"
                data={teams.map(team => ({
                    display: formatTeamName(team),
                    value: team._id,
                }))}
            />
        </ScrollView>
    )
}

export default PublicUserStatsScene
