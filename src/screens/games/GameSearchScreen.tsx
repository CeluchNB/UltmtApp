import { Chip } from 'react-native-paper'
import FilterModal from '../../components/molecules/FilterModal'
import { Game } from '../../types/game'
import GameCard from '../../components/atoms/GameCard'
import { GameSearchProps } from '../../types/navigation'
import SearchBar from '../../components/atoms/SearchBar'
import { parseLiveValue } from '../../utils/form-utils'
import { searchGames } from '../../services/data/game'
import { useColors } from '../../hooks'
import { useInfiniteQuery } from 'react-query'
import { weight } from '../../theme/fonts'
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import React, { useState } from 'react'

const PAGE_SIZE = 10

const GameSearchScreen: React.FC<GameSearchProps> = ({ route }) => {
    const { colors } = useColors()
    const { live: defaultLive } = route.params

    const [modalVisible, setModalVisible] = useState(false)
    const [q, setQ] = useState('')
    const [live, setLive] = useState(defaultLive)
    const [after, setAfter] = useState(new Date('2022-01-02'))
    const [before, setBefore] = useState(new Date())

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
    }) => {
        const {
            live: filterLive,
            after: filterAfter,
            before: filterBefore,
        } = formData
        setLive(filterLive)
        setAfter(filterAfter)
        setBefore(filterBefore)
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
    })

    return (
        <SafeAreaView style={styles.screen}>
            <View>
                <SearchBar
                    placeholder="Search games..."
                    onChangeText={search}
                    filter={true}
                    onFilterPress={() => {
                        setModalVisible(true)
                    }}
                />
            </View>
            <FilterModal
                visible={modalVisible}
                defaultValues={{ live, after, before }}
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
                                {data?.pages.flat().length} results
                            </Text>
                        </Chip>
                    </View>
                    <View>
                        <Chip mode="outlined" style={styles.resultChip}>
                            <Text style={styles.resultChipText}>
                                {
                                    data?.pages
                                        .flat()
                                        .filter(g => g.teamOneActive).length
                                }{' '}
                                live results
                            </Text>
                        </Chip>
                    </View>
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
                renderItem={({ item: game }) => (
                    <GameCard key={game._id} game={game} onPress={() => {}} />
                )}
                keyExtractor={(item, i) => {
                    return `${item._id}${i}`
                }}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={() => {
                    return isLoading || isFetchingNextPage ? (
                        <ActivityIndicator
                            color={colors.textPrimary}
                            size="large"
                            testID="infinite-scroll-indicator"
                        />
                    ) : null
                }}
                testID="game-search-list"
            />
        </SafeAreaView>
    )
}

export default GameSearchScreen
