import React from 'react'
import SmallLeaderListItem from '../atoms/SmallLeaderListItem'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import {
    convertGameStatsToLeaderItems,
    convertTeamStatsToGameOverviewItems,
} from '../../utils/stats'
import {
    getGameStatsByTeam,
    getTeamStatsByGame,
} from '../../services/data/stats'

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

    const { data: gameStats, isLoading: gameLoading } = useQuery(
        ['getGameStatsByTeam', { gameId, teamId }],
        () => getGameStatsByTeam(gameId, teamId || ''),
    )

    const { data: teamStats, isLoading: teamLoading } = useQuery(
        ['getTeamStatsByGame', { gameIds: [gameId], teamId }],
        () => getTeamStatsByGame(teamId || '', [gameId]),
    )

    const leaderData = React.useMemo(() => {
        return convertGameStatsToLeaderItems(gameStats)
    }, [gameStats])

    const gameOverviewData = React.useMemo(() => {
        return convertTeamStatsToGameOverviewItems(teamStats)
    }, [teamStats])

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
            <View>
                <Text style={styles.title}>Leaderboard</Text>
                {gameLoading && (
                    <ActivityIndicator
                        size="large"
                        color={colors.textPrimary}
                    />
                )}
                {leaderData.length > 0 && (
                    <FlatList
                        data={leaderData}
                        horizontal
                        renderItem={({ item }) => {
                            return <SmallLeaderListItem leader={item} />
                        }}
                    />
                )}
            </View>
            <View>
                <Text style={styles.title}>Game Overview</Text>
                {teamLoading && (
                    <ActivityIndicator
                        size="large"
                        color={colors.textPrimary}
                    />
                )}
                {gameOverviewData.length > 0 && (
                    <FlatList
                        data={gameOverviewData}
                        horizontal
                        renderItem={({ item }) => {
                            return <SmallLeaderListItem leader={item} />
                        }}
                    />
                )}
            </View>
        </View>
    )
}

export default TeamGameStatsScene
