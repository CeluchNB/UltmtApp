import { Game } from '../types/game'
import GameCard from '../components/atoms/GameCard'
import { GameSearchProps } from '../types/navigation'
import MapSection from '../components/molecules/MapSection'
import SearchBar from '../components/atoms/SearchBar'
import { searchGames } from '../services/data/game'
import React, { useEffect } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import { useColors, useLazyData } from '../hooks'

const GameSearchScreen: React.FC<GameSearchProps> = ({ route }) => {
    const { colors } = useColors()
    const { live } = route.params

    const { data, loading, fetch } = useLazyData<Game[]>(searchGames)

    useEffect(() => {
        fetch('', live)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const search = (q?: string) => {
        fetch(q, live)
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
    })

    return (
        <SafeAreaView style={styles.screen}>
            <View>
                <SearchBar
                    placeholder="Search games..."
                    onChangeText={search}
                    filter={true}
                    onFilterPress={() => {
                        console.log('filter press')
                    }}
                />
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
