import * as StatsData from './../../services/data/stats'
import { DataTable } from 'react-native-paper'
import { PlayerStats } from '../../types/stats'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
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
}

const PublicUserStatsScene: React.FC<PublicUserStatsSceneProps> = ({
    userId,
}) => {
    const {
        theme: { colors },
    } = useTheme()

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

    const styles = StyleSheet.create({
        titleCell: {
            color: colors.textPrimary,
        },
        valueCell: {
            color: colors.textSecondary,
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
            testID="public-user-scroll-view">
            {loading && (
                <ActivityIndicator color={colors.textPrimary} size="large" />
            )}
            {error && <Text style={styles.error}>{error.message}</Text>}
            {!loading && !error && (
                <View>
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                        }}>
                        <SecondaryButton
                            style={{ flexGrow: 1 }}
                            text="Filter by Game"
                            onPress={async () => {}}
                        />
                        <SecondaryButton
                            style={{ flexGrow: 1 }}
                            text="Filter by Team"
                            onPress={async () => {}}
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
        </ScrollView>
    )
}

export default PublicUserStatsScene
