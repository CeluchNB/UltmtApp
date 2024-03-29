import CompletionsCharts from '../molecules/CompletionsCharts'
import { Game } from '../../types/game'
import GameListItem from '../atoms/GameListItem'
import PlayerConnectionsView from './PlayerConnectionsView'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import SmallLeaderListItem from '../atoms/SmallLeaderListItem'
import StatsTable from '../molecules/StatsTable'
import { getTeamStats } from '../../services/data/stats'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import {
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
} from 'react-native'
import StatsFilterModal, { CheckBoxItem } from '../molecules/StatsFilterModal'
import {
    calculateCompletionsValues,
    convertGameStatsToLeaderItems,
    convertTeamStatsToTeamOverviewItems,
} from '../../utils/stats'

interface PublicTeamStatsSceneProps {
    teamId: string
    games: Game[]
}

const PublicTeamStatsScene: React.FC<PublicTeamStatsSceneProps> = ({
    teamId,
    games,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const navigation = useNavigation()

    const [modalVisible, setModalVisible] = React.useState(false)
    const [gameFilterOptions, setGameFilterOptions] = React.useState<
        CheckBoxItem[]
    >([])
    const gameIds = React.useMemo(() => {
        return gameFilterOptions
            .filter(value => value.checked)
            .map(value => value.value)
    }, [gameFilterOptions])

    const { data, isLoading, isRefetching, refetch } = useQuery(
        ['getTeamStats', { teamId, gameIds }],
        () => getTeamStats(teamId, gameIds),
        { enabled: !modalVisible },
    )

    React.useEffect(() => {
        if (!data) return
        const gamesMap = new Map<string, Game>()
        for (const game of games) {
            gamesMap.set(game?._id, game)
        }

        setGameFilterOptions(curr => {
            const currentChecked = new Map<string, boolean>()
            for (const item of curr) {
                currentChecked.set(item.value, item.checked)
            }

            return games
                .filter(game => gamesMap.has(game._id))
                .map(game => {
                    return {
                        display: <GameListItem game={game} teamId={teamId} />,
                        value: game!._id,
                        checked: currentChecked.get(game._id) || false,
                    }
                })
        })
    }, [games, data, teamId])

    const teamOverview = React.useMemo(() => {
        return convertTeamStatsToTeamOverviewItems(data)
    }, [data])

    const leaders = React.useMemo(() => {
        return convertGameStatsToLeaderItems(data)
    }, [data])

    const completionsToScores = React.useMemo(() => {
        if (!data) return []
        return calculateCompletionsValues(data.completionsToScore)
    }, [data])

    const completionsToTurnovers = React.useMemo(() => {
        if (!data) return []
        return calculateCompletionsValues(data.completionsToTurnover)
    }, [data])

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

    const onFilter = () => {
        setModalVisible(false)
        refetch()
    }

    const styles = StyleSheet.create({
        title: {
            fontSize: size.fontThirty,
            color: colors.textSecondary,
        },
        button: {
            alignSelf: 'flex-end',
            margin: 5,
        },
    })

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    onRefresh={refetch}
                    refreshing={isLoading || isRefetching}
                    colors={[colors.textSecondary]}
                    tintColor={colors.textSecondary}
                />
            }>
            <SecondaryButton
                style={styles.button}
                text="Filter by Game"
                onPress={async () => {
                    setModalVisible(true)
                }}
            />
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
                    return (
                        <SmallLeaderListItem
                            leader={item}
                            onPress={player => {
                                if (player?.playerId || player?._id) {
                                    navigation.navigate('PublicUserDetails', {
                                        userId: player?.playerId ?? player?._id,
                                    })
                                }
                            }}
                        />
                    )
                }}
            />
            <CompletionsCharts
                completionsToScores={completionsToScores}
                completionsToTurnovers={completionsToTurnovers}
            />
            <PlayerConnectionsView
                players={data?.players || []}
                games={gameIds}
                teams={[teamId]}
            />
            <Text style={styles.title}>Players</Text>
            {data && <StatsTable players={data.players || []} />}
            <StatsFilterModal
                visible={modalVisible}
                title="Games"
                data={gameFilterOptions}
                onSelect={onGameSelect}
                onClear={onGameClear}
                onDone={onFilter}
            />
        </ScrollView>
    )
}

export default PublicTeamStatsScene
