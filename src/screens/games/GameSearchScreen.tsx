import { Chip } from 'react-native-paper'
import GameCard from '../../components/atoms/GameCard'
import GameFilterModal from '../../components/molecules/GameFilterModal'
import { GameSearchProps } from '../../types/navigation'
import SearchBar from '../../components/atoms/SearchBar'
import TeamListItem from '../../components/atoms/TeamListItem'
import UserListItem from '../../components/atoms/UserListItem'
import { parseLiveValue } from '../../utils/form-utils'
import { searchGames } from '../../services/data/game'
import { searchTeam } from '../../services/data/team'
import { searchUsers } from '../../services/data/user'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { Game, GameStatus } from '../../types/game'
import React, { useState } from 'react'
import { useInfiniteQuery, useQuery } from 'react-query'

const PAGE_SIZE = 10

const GameSearchScreen: React.FC<GameSearchProps> = ({ navigation, route }) => {
    const {
        theme: { colors, weight, size },
    } = useTheme()
    const { live: defaultLive } = route.params

    const [modalVisible, setModalVisible] = useState(false)
    const [q, setQ] = useState('')
    const [live, setLive] = useState(defaultLive)
    const [after, setAfter] = useState(new Date('2022-01-02'))
    const [before, setBefore] = useState(
        new Date(new Date().setDate(new Date().getDate() + 7)),
    )
    const [showUsers, setShowUsers] = useState(true)
    const [showTeams, setShowTeams] = useState(true)

    const { data, isLoading, isFetchingNextPage, fetchNextPage } =
        useInfiniteQuery(
            ['games', q, live, after, before],
            ({ pageParam = 0 }): Promise<Game[]> => {
                return searchGames(
                    q,
                    parseLiveValue(live),
                    after.toLocaleDateString('en-US'),
                    before.toLocaleDateString('en-US'),
                    PAGE_SIZE,
                    PAGE_SIZE * pageParam,
                )
            },
            {
                getNextPageParam: (lastPage, allPages) => {
                    if (lastPage.length > 0) {
                        return allPages.length
                    }
                    return undefined
                },
            },
        )

    const { data: users } = useQuery(
        ['searchUsers', q, showUsers],
        () => {
            return searchUsers(q)
        },
        { enabled: showUsers },
    )

    const { data: teams } = useQuery(
        ['searchTeam', q, showTeams],
        () => {
            return searchTeam(q)
        },
        { enabled: showTeams },
    )

    const search = (query: string = '') => {
        setQ(query)
    }

    const loadMore = () => {
        if (!isFetchingNextPage && !isLoading) {
            fetchNextPage()
        }
    }

    const closeFilters = (formData: {
        live: string
        after: Date
        before: Date
        showUsers: boolean
        showTeams: boolean
    }) => {
        const {
            live: filterLive,
            after: filterAfter,
            before: filterBefore,
            showUsers: filterShowUsers,
            showTeams: filterShowTeams,
        } = formData
        setLive(filterLive)
        setAfter(filterAfter)
        setBefore(filterBefore)
        setShowUsers(filterShowUsers ?? false)
        setShowTeams(filterShowTeams ?? false)
        setModalVisible(false)
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        container: {
            width: '90%',
            alignSelf: 'center',
            marginBottom: 5,
        },
        chip: {
            borderRadius: 4,
            marginRight: 5,
            backgroundColor: colors.textPrimary,
            color: colors.primary,
        },
        resultChip: {
            borderRadius: 4,
            marginRight: 5,
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            borderColor: colors.textPrimary,
        },
        chipText: {
            fontWeight: weight.bold,
            color: colors.primary,
        },
        resultChipText: {
            color: colors.textPrimary,
            fontWeight: weight.bold,
        },
        listContainer: {
            width: '90%',
            alignSelf: 'center',
        },
        header: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            fontWeight: weight.bold,
        },
    })

    const footer = () => {
        return isLoading || isFetchingNextPage ? (
            <ActivityIndicator
                color={colors.textPrimary}
                size="large"
                testID="infinite-scroll-indicator"
            />
        ) : null
    }

    return (
        <SafeAreaView style={styles.screen}>
            <View>
                <SearchBar
                    placeholder="Search..."
                    onChangeText={search}
                    filter={true}
                    autoFocus={true}
                    focusable={true}
                    onFilterPress={() => {
                        setModalVisible(true)
                    }}
                />
            </View>
            <GameFilterModal
                visible={modalVisible}
                defaultValues={{ live, after, before, showUsers, showTeams }}
                onClose={closeFilters}
            />
            <View>
                <ScrollView
                    style={styles.container}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}>
                    <View>
                        <Chip mode="outlined" style={styles.resultChip}>
                            <Text style={styles.resultChipText}>
                                {data?.pages.flat().length} games
                            </Text>
                        </Chip>
                    </View>
                    <View>
                        <Chip mode="outlined" style={styles.resultChip}>
                            <Text style={styles.resultChipText}>
                                {
                                    data?.pages
                                        .flat()
                                        .filter(
                                            g =>
                                                g.teamOneStatus ===
                                                GameStatus.ACTIVE,
                                        ).length
                                }{' '}
                                live games
                            </Text>
                        </Chip>
                    </View>
                    {showUsers && (
                        <View>
                            <Chip mode="outlined" style={styles.resultChip}>
                                <Text style={styles.resultChipText}>
                                    {users?.length ?? 0} users
                                </Text>
                            </Chip>
                        </View>
                    )}
                    {showTeams && (
                        <View>
                            <Chip mode="outlined" style={styles.resultChip}>
                                <Text style={styles.resultChipText}>
                                    {teams?.length ?? 0} teams
                                </Text>
                            </Chip>
                        </View>
                    )}
                    <View>
                        <Chip mode="flat" style={styles.chip}>
                            {live === 'true' && (
                                <Text style={styles.chipText}>Live games</Text>
                            )}
                            {live === 'false' && <Text>Completed games</Text>}
                            {live !== 'true' && live !== 'false' && (
                                <Text style={styles.chipText}>All games</Text>
                            )}
                        </Chip>
                    </View>
                    <View>
                        <Chip mode="outlined" style={styles.chip}>
                            <Text style={styles.chipText}>
                                After: {after.toLocaleDateString()}
                            </Text>
                        </Chip>
                    </View>
                    <View>
                        <Chip mode="flat" style={styles.chip}>
                            <Text style={styles.chipText}>
                                Before: {before.toLocaleDateString('en-US')}
                            </Text>
                        </Chip>
                    </View>
                </ScrollView>
            </View>
            <FlatList
                data={data?.pages.flat()}
                ListHeaderComponent={
                    <ScrollView>
                        {users && users.length > 0 && (
                            <View>
                                <Text
                                    style={[
                                        styles.header,
                                        styles.listContainer,
                                    ]}>
                                    Users
                                </Text>
                                {users.map(user => {
                                    return (
                                        <View
                                            style={styles.listContainer}
                                            key={user._id}>
                                            <UserListItem
                                                user={user}
                                                onPress={async () => {
                                                    navigation.navigate(
                                                        'PublicUserDetails',
                                                        { userId: user._id },
                                                    )
                                                }}
                                            />
                                        </View>
                                    )
                                })}
                            </View>
                        )}
                        {teams && teams.length > 0 && (
                            <View>
                                <Text
                                    style={[
                                        styles.header,
                                        styles.listContainer,
                                    ]}>
                                    Teams
                                </Text>
                                {teams.map(team => {
                                    return (
                                        <View
                                            style={styles.listContainer}
                                            key={team._id}>
                                            <TeamListItem
                                                team={team}
                                                onPress={async () => {
                                                    navigation.navigate(
                                                        'PublicTeamDetails',
                                                        { id: team._id },
                                                    )
                                                }}
                                            />
                                        </View>
                                    )
                                })}
                            </View>
                        )}
                        {data && data?.pages.flat().length > 0 && (
                            <Text style={[styles.header, styles.listContainer]}>
                                Games
                            </Text>
                        )}
                    </ScrollView>
                }
                renderItem={({ item: game }) => (
                    <View style={styles.listContainer}>
                        <GameCard
                            game={game}
                            onPress={() => {
                                navigation.navigate('ViewGame', {
                                    gameId: game._id,
                                })
                            }}
                        />
                    </View>
                )}
                keyExtractor={(item, i) => {
                    return `${item._id}${i}`
                }}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={footer}
                testID="game-search-list"
            />
        </SafeAreaView>
    )
}

export default GameSearchScreen
