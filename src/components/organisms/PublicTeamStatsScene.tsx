import React from 'react'
import SmallLeaderListItem from '../atoms/SmallLeaderListItem'
import { convertTeamStatsToTeamOverviewItems } from '../../utils/stats'
import { getTeamStats } from '../../services/data/stats'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import { FlatList, ScrollView, StyleSheet, Text } from 'react-native'

interface PublicTeamStatsSceneProps {
    teamId: string
}

const PublicTeamStatsScene: React.FC<PublicTeamStatsSceneProps> = ({
    teamId,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const { data, error } = useQuery(['getTeamStats', { teamId }], () =>
        getTeamStats(teamId),
    )

    const teamOverview = React.useMemo(() => {
        return convertTeamStatsToTeamOverviewItems(data)
    }, [data])

    const styles = StyleSheet.create({
        title: {
            fontSize: size.fontThirty,
            color: colors.textPrimary,
        },
    })

    return (
        <ScrollView>
            <Text style={styles.title}>Overview</Text>
            <FlatList
                horizontal
                data={teamOverview}
                renderItem={({ item }) => {
                    return <SmallLeaderListItem leader={item} />
                }}
            />
        </ScrollView>
    )
}

export default PublicTeamStatsScene
