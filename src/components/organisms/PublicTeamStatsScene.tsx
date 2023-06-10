import { Game } from '../../types/game'
import GameListItem from '../atoms/GameListItem'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
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
import StatsFilterModal, { CheckBoxItem } from '../molecules/StatsFilterModal'
import {
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
        // TODO: simplify this
        setGameFilterOptions(curr =>
            games
                .filter(game => data?.games.includes(game._id))
                .map(game => ({
                    display: <GameListItem game={game} teamId={teamId} />,
                    value: game._id,
                    checked:
                        curr.find(value => value.value === game._id)?.checked ||
                        false,
                })),
        )
    }, [games, data, teamId])

    const teamOverview = React.useMemo(() => {
        return convertTeamStatsToTeamOverviewItems(data)
    }, [data])

    const leaders = React.useMemo(() => {
        return convertGameStatsToLeaderItems(data)
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
        onFilter()
    }

    const onFilter = () => {
        setModalVisible(false)
        refetch()
    }

    const styles = StyleSheet.create({
        title: {
            fontSize: size.fontThirty,
            color: colors.textPrimary,
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
                    return <SmallLeaderListItem leader={item} />
                }}
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
