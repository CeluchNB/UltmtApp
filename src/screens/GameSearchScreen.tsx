import { Chip } from 'react-native-paper'
import FilterModal from '../components/molecules/FilterModal'
import { Game } from '../types/game'
import GameCard from '../components/atoms/GameCard'
import { GameSearchProps } from '../types/navigation'
import MapSection from '../components/molecules/MapSection'
import SearchBar from '../components/atoms/SearchBar'
import { parseLiveValue } from '../utils/form-utils'
import { searchGames } from '../services/data/game'
import { weight } from '../theme/fonts'
import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColors, useLazyData } from '../hooks'

const GameSearchScreen: React.FC<GameSearchProps> = ({ route }) => {
    const { colors } = useColors()
    const { live: defaultLive } = route.params
    const [modalVisible, setModalVisible] = useState(false)
    const [q, setQ] = useState('')
    const [live, setLive] = useState(defaultLive)
    const [after, setAfter] = useState(new Date('2022-01-02'))
    const [before, setBefore] = useState(new Date())

    const { data, loading, fetch } = useLazyData<Game[]>(searchGames)

    useEffect(() => {
        fetch(
            q,
            parseLiveValue(live),
            after.toLocaleDateString('en-US'),
            before.toLocaleDateString('en-US'),
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, live, after, before])

    const search = (query: string = '') => {
        setQ(query)
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
        },
        chip: {
            borderRadius: 4,
            marginRight: 5,
            backgroundColor: `${colors.textPrimary}`,
            color: colors.primary,
        },
        chipText: {
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
                        <Chip mode="flat" style={styles.chip}>
                            {live === 'true' && <Text>Live games</Text>}
                            {live === 'false' && <Text>Completed games</Text>}
                            {live !== 'true' && live !== 'false' && (
                                <Text>All games</Text>
                            )}
                        </Chip>
                    </View>
                    <View>
                        <Chip mode="outlined" style={styles.chip}>
                            After: {after.toLocaleDateString()}
                        </Chip>
                    </View>
                    <View>
                        <Chip mode="flat" style={styles.chip}>
                            Before: {before.toLocaleDateString('en-US')}
                        </Chip>
                    </View>
                </ScrollView>
            </View>
            <ScrollView style={styles.container}>
                <MapSection
                    title="Results"
                    showButton={false}
                    showCreateButton={false}
                    loading={loading}
                    listData={data}
                    renderItem={game => (
                        <GameCard
                            key={game._id}
                            game={game}
                            onPress={() => {}}
                        />
                    )}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default GameSearchScreen
