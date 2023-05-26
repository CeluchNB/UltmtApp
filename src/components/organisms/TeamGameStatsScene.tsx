import React from 'react'
import SmallLeaderListItem from '../atoms/SmallLeaderListItem'
import { convertGameStatsToLeaderItems } from '../../utils/stats'
import { getGameStatsByTeam } from '../../services/data/stats'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native'

interface TeamGameStatsSceneProps {
    gameId: string
    teamId?: string
}

const TeamGameStatsScene: React.FC<TeamGameStatsSceneProps> = ({
    gameId,
    teamId,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const { data, isLoading } = useQuery(
        ['getGameStatsByTeam', { gameId, teamId }],
        () => getGameStatsByTeam(gameId, teamId || ''),
    )

    const leaderData = React.useMemo(() => {
        return convertGameStatsToLeaderItems(data)
    }, [data])

    const styles = StyleSheet.create({
        title: {
            fontSize: size.fontThirty,
            color: colors.textPrimary,
        },
    })

    if (!teamId) {
        return (
            <View>
                <Text>This team is not contributing stats for this game.</Text>
            </View>
        )
    }

    return (
        <View>
            {isLoading && (
                <ActivityIndicator size="large" color={colors.textPrimary} />
            )}
            {data && (
                <View>
                    <Text style={styles.title}>Leaderboard</Text>
                    <FlatList
                        data={leaderData}
                        horizontal
                        renderItem={({ item }) => {
                            return <SmallLeaderListItem leader={item} />
                        }}
                    />
                </View>
            )}
        </View>
    )
}

export default TeamGameStatsScene
