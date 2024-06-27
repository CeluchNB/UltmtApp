import * as Constants from '../../utils/constants'
import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { OfflineGameOptionsProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { useQuery } from 'react-query'
import { useReenterGame } from '../../hooks/game-edit-actions/use-reenter-game'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

import {
    getOfflineGameById,
    // pushOfflineGame
} from '../../services/data/game'

const OfflineGameOptionsScreen: React.FC<OfflineGameOptionsProps> = ({
    navigation,
    route,
}) => {
    const gameId = route.params.gameId
    const {
        theme: { colors, size },
    } = useTheme()
    // const { onReactivateGame } = useGameReactivation()
    const { mutateAsync: reenterGame, isLoading: reenterLoading } =
        useReenterGame()
    const { data: game } = useQuery(['getOfflineGameById', { gameId }], () =>
        getOfflineGameById(gameId),
    )
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const pushGame = async () => {
        setLoading(true)
        try {
            // await pushOfflineGame(gameId)
            navigation.navigate('ActiveGames')
        } catch (e: any) {
            setError(e?.message ?? Constants.FINISH_GAME_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const reactivateGame = async () => {
        if (game) {
            await reenterGame({ gameId: game._id, teamId: game.teamOne._id })
        }
    }

    const styles = StyleSheet.create({
        button: {
            marginTop: 10,
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontTwenty,
        },
    })
    return (
        <BaseScreen containerWidth={80}>
            {game && (
                <View>
                    <GameHeader header game={game} />
                    <PrimaryButton
                        style={styles.button}
                        text="push to cloud"
                        loading={loading}
                        disabled={loading}
                        onPress={pushGame}
                    />
                    {error.length > 0 && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}
                    <SecondaryButton
                        style={styles.button}
                        text="reactivate"
                        loading={reenterLoading}
                        onPress={reactivateGame}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default OfflineGameOptionsScreen
