import ActiveGameWarning from '../../components/atoms/ActiveGameWarning'
import { FAB } from 'react-native-paper'
import GameCard from '../../components/atoms/GameCard'
import { GameHomeProps } from '../../types/navigation'
import MapSection from '../../components/molecules/MapSection'
import SearchBar from '../../components/atoms/SearchBar'
import { fetchProfile } from '../../services/data/user'
import { gameIsActive } from '../../utils/game'
import { setProfile } from '../../store/reducers/features/account/accountReducer'
import { useDispatch } from 'react-redux'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import { Game, GameStatus } from '../../types/game'
import React, { useMemo } from 'react'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { getActiveGames, searchGames } from '../../services/data/game'

const GameHomeScreen: React.FC<GameHomeProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const dispatch = useDispatch()

    const { refetch: refetchProfile } = useQuery(
        ['fetchProfile'],
        () => fetchProfile(),
        {
            onSuccess: data => {
                dispatch(setProfile(data))
            },
        },
    )

    const {
        data,
        isLoading,
        refetch: refetchGames,
    } = useQuery(['searchGames'], () => searchGames())

    const { data: activeGames, refetch: activeGameRefetch } = useQuery<Game[]>(
        ['activeGames'],
        () => getActiveGames(),
        { cacheTime: 0 },
    )

    const liveGames = useMemo(() => {
        return data?.filter(g => gameIsActive(g))
    }, [data])

    const refetch = React.useCallback(() => {
        refetchProfile()
        refetchGames()
        activeGameRefetch()
    }, [refetchProfile, refetchGames, activeGameRefetch])

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refetch()
        })
        return () => {
            unsubscribe()
        }
    }, [navigation, refetch])

    const recentGames = useMemo(() => {
        return data?.filter(g => g.teamOneStatus !== GameStatus.ACTIVE)
    }, [data])

    const navigateToSearch = (live: string) => {
        navigation.navigate('GameSearch', { live })
    }

    const navigateToCreate = () => {
        navigation.navigate('SelectMyTeam')
    }

    const navigateToViewGame = (gameId: string) => {
        navigation.navigate('ViewGame', { gameId })
    }

    const renderGame = (game: Game) => {
        return (
            <GameCard
                key={game._id}
                game={game}
                onPress={() => {
                    navigateToViewGame(game._id)
                }}
            />
        )
    }

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
            fontSize: size.fontThirty,
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
        activeGameContainer: { alignSelf: 'center', margin: 5 },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <SearchBar
                placeholder="Search..."
                onPress={() => navigateToSearch('undefined')}
            />
            <View style={styles.activeGameContainer}>
                <ActiveGameWarning
                    count={activeGames?.length}
                    onPress={() => {
                        navigation.navigate('ActiveGames')
                    }}
                />
            </View>
            <ScrollView
                style={styles.container}
                testID="game-home-scroll-view"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        onRefresh={refetch}
                        refreshing={isLoading}
                        colors={[colors.textSecondary]}
                        tintColor={colors.textSecondary}
                    />
                }>
                {liveGames && liveGames.length > 0 && (
                    <MapSection
                        title="Live Games"
                        showButton={true}
                        showCreateButton={false}
                        listData={liveGames}
                        renderItem={renderGame}
                        loading={isLoading}
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
                {(!data || data?.length < 1) && !isLoading && (
                    <Text style={styles.errorText}>
                        No games available currently. Try refreshing or
                        searching.
                    </Text>
                )}
            </ScrollView>
            <FAB
                icon="plus"
                testID="create-button-fab"
                style={styles.fab}
                color={colors.primary}
                onPress={navigateToCreate}
            />
        </SafeAreaView>
    )
}

export default GameHomeScreen
