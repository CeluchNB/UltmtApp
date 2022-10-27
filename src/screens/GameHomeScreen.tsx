import { Game } from '../types/game'
import GameCard from '../components/atoms/GameCard'
import MapSection from '../components/molecules/MapSection'
import React from 'react'
import { TextInput } from 'react-native-paper'
import { searchGames } from '../services/data/game'
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native'
import { useColors, useData } from '../hooks'

const GameHomeScreen: React.FC<{}> = () => {
    const { colors } = useColors()

    const { data: liveGames, loading: liveLoading } = useData<Game[]>(
        searchGames,
        undefined,
        true,
    )
    const { data: recentGames, loading: recentLoading } = useData<Game[]>(
        searchGames,
        undefined,
        false,
    )

    const renderGame = (game: Game) => {
        return (
            <GameCard
                key={game._id}
                teamOne={game.teamOne}
                teamTwo={game.teamTwo}
                teamOneScore={game.teamOneScore}
                teamTwoScore={game.teamTwoScore}
                scoreLimit={game.scoreLimit}
            />
        )
    }

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
            fontSize: 20,
        },
        container: {
            width: '90%',
            alignSelf: 'center',
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
            <ScrollView style={styles.container}>
                <MapSection
                    title="Live Games"
                    showButton={false}
                    showCreateButton={false}
                    listData={liveGames}
                    renderItem={renderGame}
                    loading={liveLoading}
                />
                {recentGames && recentGames.length > 0 && (
                    <MapSection
                        title="Recent Games"
                        showButton={true}
                        showCreateButton={false}
                        listData={recentGames}
                        renderItem={renderGame}
                        loading={recentLoading}
                        buttonText="explore more games"
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

export default GameHomeScreen
