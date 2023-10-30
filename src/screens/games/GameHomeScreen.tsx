import { FAB } from 'react-native-paper'
import { Game } from '../../types/game'
import GameCard from '../../components/atoms/GameCard'
import { GameHomeProps } from '../../types/navigation'
import MapSection from '../../components/molecules/MapSection'
import SearchBar from '../../components/atoms/SearchBar'
import { fetchProfile } from '../../services/data/user'
import { setProfile } from '../../store/reducers/features/account/accountReducer'
import { useDispatch } from 'react-redux'
import { useTheme } from '../../hooks'
import React, { useMemo } from 'react'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
} from 'react-native'
import { deleteExpiredGameViews, searchGames } from '../../services/data/game'
import { useMutation, useQuery } from 'react-query'

const GameHomeScreen: React.FC<GameHomeProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const dispatch = useDispatch()

    useQuery(['fetchProfile'], () => fetchProfile(), {
        onSuccess: data => {
            dispatch(setProfile(data))
        },
    })

    const { mutate: onDeletGameViews } = useMutation(() =>
        deleteExpiredGameViews(),
    )

    const { data, isLoading, refetch } = useQuery(['searchGames'], () =>
        searchGames(),
    )
    const liveGames = useMemo(() => {
        return data?.filter(g => g.teamOneActive)
    }, [data])

    const recentGames = useMemo(() => {
        return data?.filter(g => !g.teamOneActive)
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

    React.useEffect(() => {
        onDeletGameViews()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
