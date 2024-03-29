import { ApiError } from '../../types/services'
import BaseScreen from '../atoms/BaseScreen'
import { DisplayTeam } from '../../types/team'
import { Game } from '../../types/game'
import GameListItem from '../atoms/GameListItem'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import {
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    View,
} from 'react-native'

export interface PublicUserGamesSceneProps {
    gameLists: { title: string; year: string; data: Game[]; index: number }[]
    teams: DisplayTeam[]
    loading: boolean
    error?: ApiError
    refetch: () => void
}

const PublicUserGamesScene: React.FC<PublicUserGamesSceneProps> = ({
    gameLists,
    teams,
    loading,
    error,
    refetch,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const navigation = useNavigation()

    const styles = StyleSheet.create({
        teamTitle: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            fontWeight: weight.bold,
        },
        teamSeason: {
            color: colors.textSecondary,
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
        },
        error: {
            alignSelf: 'center',
            fontSize: size.fontThirty,
            color: colors.gray,
        },
    })

    return (
        <BaseScreen containerWidth={80}>
            {error && <Text style={styles.error}>{error.message}</Text>}
            {gameLists.length === 0 && (
                <Text style={styles.error}>
                    This user has not participated in any games yet
                </Text>
            )}
            {!loading && !error && (
                <SectionList
                    sections={gameLists}
                    refreshControl={
                        <RefreshControl
                            colors={[colors.textSecondary]}
                            tintColor={colors.textSecondary}
                            refreshing={loading}
                            onRefresh={() => {
                                refetch()
                            }}
                        />
                    }
                    keyExtractor={item => item._id}
                    renderSectionHeader={({ section: { title, year } }) => {
                        return (
                            <View>
                                <Text style={styles.teamTitle}>{title}</Text>
                                <Text style={styles.teamSeason}>{year}</Text>
                            </View>
                        )
                    }}
                    renderItem={({ item, section }) => {
                        return (
                            <GameListItem
                                game={item}
                                teamId={teams[section.index]._id}
                                onPress={() => {
                                    navigation.navigate('ViewGame', {
                                        gameId: item._id,
                                    })
                                }}
                            />
                        )
                    }}
                    testID="public-user-game-section-list"
                />
            )}
        </BaseScreen>
    )
}

export default PublicUserGamesScene
