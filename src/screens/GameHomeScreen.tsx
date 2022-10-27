import { Game } from '../types/game'
import GameCard from '../components/atoms/GameCard'
import MapSection from '../components/molecules/MapSection'
import { TextInput } from 'react-native-paper'
import { searchGames } from '../services/data/game'
import { size } from '../theme/fonts'
import React, { useMemo } from 'react'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
} from 'react-native'
import { useColors, useData } from '../hooks'

const GameHomeScreen: React.FC<{}> = () => {
    const { colors } = useColors()

    const { data, loading, refetch } = useData<Game[]>(searchGames)

    const renderGame = (game: Game) => {
        return (
            <GameCard
                key={game._id}
                id={game._id}
                teamOne={game.teamOne}
                teamTwo={game.teamTwo}
                teamOneScore={game.teamOneScore}
                teamTwoScore={game.teamTwoScore}
                scoreLimit={game.scoreLimit}
                onPress={() => {}}
            />
        )
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
        input: {
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            width: '90%',
            alignSelf: 'center',
            marginBottom: 5,
            fontSize: size.fontMedium,
        },
        container: {
            width: '90%',
            alignSelf: 'center',
        },
        errorText: {
            alignSelf: 'center',
            fontSize: size.fontLarge,
            color: colors.gray,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <TextInput
                mode="flat"
                style={[styles.input]}
                underlineColor={colors.textPrimary}
                activeUnderlineColor={colors.textPrimary}
                placeholderTextColor={colors.gray}
                theme={{
                    colors: {
                        text: colors.textPrimary,
                    },
                }}
                placeholder={`Search games...`}
            />
            <ScrollView
                style={styles.container}
                testID="game-home-scroll-view"
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
                        loading={false}
                        buttonText="explore live games"
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
                    />
                )}
                {(!data || data?.length < 1) && (
                    <Text style={styles.errorText}>
                        No games available currently. Try refreshing or
                        searching.
                    </Text>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

export default GameHomeScreen
