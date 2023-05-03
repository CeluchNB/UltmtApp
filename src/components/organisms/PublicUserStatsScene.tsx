import { ApiError } from '../../types/services'
import { DataTable } from 'react-native-paper'
import { PlayerStats } from '../../types/stats'
import React from 'react'
import { useTheme } from '../../hooks'
import { ScrollView, StyleSheet } from 'react-native'

export interface PublicUserStatsSceneProps {
    loading: boolean
    refetch: () => void
    stats?: PlayerStats
    error?: ApiError
}

const PublicUserStatsScene: React.FC<PublicUserStatsSceneProps> = ({
    loading,
    refetch,
    stats,
}) => {
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
    const {
        theme: { colors },
    } = useTheme()
    const styles = StyleSheet.create({
        titleCell: {
            color: colors.textPrimary,
        },
        valueCell: {
            color: colors.textSecondary,
        },
    })

    return (
        <ScrollView>
            <DataTable>
                {stats &&
                    Object.entries(filteredStats).map(([key, value]) => {
                        return (
                            <DataTable.Row>
                                <DataTable.Cell textStyle={styles.titleCell}>
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </DataTable.Cell>
                                <DataTable.Cell textStyle={styles.valueCell}>
                                    {value}
                                </DataTable.Cell>
                            </DataTable.Row>
                        )
                    })}
            </DataTable>
        </ScrollView>
    )
}

export default PublicUserStatsScene
