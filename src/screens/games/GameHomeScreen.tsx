import { AllScreenProps } from '../../types/navigation'
import { FAB } from 'react-native-paper'
import { Game } from '../../types/game'
import GameCard from '../../components/atoms/GameCard'
import MapSection from '../../components/molecules/MapSection'
import SearchBar from '../../components/atoms/SearchBar'
import { searchGames } from '../../services/data/game'
import { size } from '../../theme/fonts'
import React, { useMemo } from 'react'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
} from 'react-native'
import { useColors, useData } from '../../hooks'

const GameHomeScreen: React.FC<AllScreenProps> = ({ navigation }) => {
    const { colors } = useColors()

    const { data, loading, refetch } = useData<Game[]>(searchGames)

    const renderGame = (game: Game) => {
        return <GameCard key={game._id} game={game} onPress={() => {}} />
    }

    const navigateToSearch = (live: string) => {
        navigation.navigate('GameSearch', { live })
    }

    const navigateToCreate = () => {
        navigation.navigate('GameCreationFlow', { screen: 'SelectMyTeam' })
    }

    const liveGames = useMemo(() => {
        return data?.filter(g => g.teamOneActive)
    }, [data])

    const recentGames = useMemo(() => {
        return data?.filter(g => !g.teamOneActive)
    }, [data])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: { alignSelf: 'center' },
        container: {
            width: '90%',
            alignSelf: 'center',
        },
        errorText: {
            alignSelf: 'center',
            fontSize: size.fontLarge,
            color: colors.gray,
        },
        fab: {
            position: 'absolute',
            margin: 20,
            right: 0,
            bottom: 0,
            borderRadius: 8,
            backgroundColor: colors.textPrimary,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <SearchBar
                placeholder="Search games..."
                onPress={() => navigateToSearch('undefined')}
            />
            <ScrollView
                style={styles.container}
                testID="game-home-scroll-view"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl onRefresh={refetch} refreshing={loading} />
                }>
                {liveGames && liveGames.length > 0 && (
                    <MapSection
                        title="Live Games"
                        showButton={true}
                        showCreateButton={false}
                        listData={liveGames}
                        renderItem={renderGame}
                        loading={loading}
                        buttonText="explore live games"
                        onButtonPress={() => {
                            navigateToSearch('true')
                        }}
                    />
                )}
                {recentGames && recentGames.length > 0 && (
                    <MapSection
                        title="Recent Games"
                        showButton={true}
                        showCreateButton={false}
                        listData={recentGames}
                        renderItem={renderGame}
                        loading={false}
                        buttonText="explore recent games"
                        onButtonPress={() => {
                            navigateToSearch('false')
                        }}
                    />
                )}
                {(!data || data?.length < 1) && (
                    <Text style={styles.errorText}>
                        No games available currently. Try refreshing or
                        searching.
                    </Text>
                )}
            </ScrollView>
            <FAB icon="plus" style={styles.fab} onPress={navigateToCreate} />
        </SafeAreaView>
    )
}

export default GameHomeScreen