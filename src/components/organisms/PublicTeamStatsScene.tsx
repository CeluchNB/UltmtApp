import React from 'react'
import SmallLeaderListItem from '../atoms/SmallLeaderListItem'
import StatsTable from '../molecules/StatsTable'
import { getTeamStats } from '../../services/data/stats'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
} from 'react-native'
import {
    convertGameStatsToLeaderItems,
    convertTeamStatsToTeamOverviewItems,
} from '../../utils/stats'

interface PublicTeamStatsSceneProps {
    teamId: string
}

const PublicTeamStatsScene: React.FC<PublicTeamStatsSceneProps> = ({
    teamId,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const { data, isLoading, isRefetching, refetch } = useQuery(
        ['getTeamStats', { teamId }],
        () => getTeamStats(teamId),
    )

    const teamOverview = React.useMemo(() => {
        return convertTeamStatsToTeamOverviewItems(data)
    }, [data])

    const leaders = React.useMemo(() => {
        return convertGameStatsToLeaderItems(data)
    }, [data])

    const styles = StyleSheet.create({
        title: {
            fontSize: size.fontThirty,
            color: colors.textPrimary,
        },
    })

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    onRefresh={refetch}
                    refreshing={isLoading || isRefetching}
                    colors={[colors.textSecondary]}
                />
            }>
            <Text style={styles.title}>Overview</Text>
            <FlatList
                horizontal
                data={teamOverview}
                renderItem={({ item }) => {
                    return <SmallLeaderListItem leader={item} />
                }}
            />
            <Text style={styles.title}>Leaders</Text>
            <FlatList
                horizontal
                data={leaders}
                renderItem={({ item }) => {
                    return <SmallLeaderListItem leader={item} />
                }}
            />
            <Text style={styles.title}>Players</Text>
            {data && <StatsTable players={data.players || []} />}
        </ScrollView>
    )
}

export default PublicTeamStatsScene
