import { ActiveGamesProps } from '../types/navigation'
import BaseScreen from '../components/atoms/BaseScreen'
import { Game } from '../types/game'
import GameListItem from '../components/atoms/GameListItem'
import React from 'react'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { getActiveGames } from '../services/data/game'
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { size } from '../theme/fonts'
import { useGameReactivation } from '../hooks/useGameReactivation'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet, Text } from 'react-native'
import { useColors, useData } from '../hooks'

const ActiveGamesScreen: React.FC<ActiveGamesProps> = ({ navigation }) => {
    const { colors } = useColors()
    const account = useSelector(selectAccount)
    const { navigateToGame } = useGameReactivation()
    const { data: games, refetch } = useData<(Game & { offline: boolean })[]>(
        getActiveGames,
        account._id,
    )

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refetch()
        })
        return () => {
            unsubscribe()
        }
    }, [navigation, refetch])

    const getMyTeamId = (game: Game): string => {
        return (
            (game.creator._id === account._id
                ? game.teamOne._id
                : game.teamTwo._id) || ''
        )
    }

    const onGamePress = async (activeGame: Game & { offline: boolean }) => {
        // get game data
        try {
            if (activeGame.offline && !activeGame.teamOneActive) {
                navigation.navigate('OfflineGameOptions', {
                    gameId: activeGame._id,
                })
                return
            }
            navigateToGame(activeGame)
        } catch (e) {}
    }

    const styles = StyleSheet.create({
        infoText: {
            fontSize: size.fontLarge,
            color: colors.gray,
        },
        list: { marginTop: 10 },
    })

    return (
        <BaseScreen containerWidth="80%">
            <ScreenTitle title="Active Games" />
            {!games ||
                (games?.length === 0 && (
                    <Text style={styles.infoText}>No active games</Text>
                ))}
            <FlatList
                style={styles.list}
                data={games}
                renderItem={({ item }) => {
                    return (
                        <GameListItem
                            game={item}
                            teamId={getMyTeamId(item)}
                            onPress={() => {
                                onGamePress(item)
                            }}
                        />
                    )
                }}
            />
        </BaseScreen>
    )
}

export default ActiveGamesScreen
