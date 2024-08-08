import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { OfflineGameOptionsProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { getOfflineGameById } from '../../services/data/game'
import { usePushFullGame } from '../../hooks/game-edit-actions/use-push-full-game'
import { useQuery } from 'react-query'
import { useReenterGame } from '../../hooks/game-edit-actions/use-reenter-game'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

const OfflineGameOptionsScreen: React.FC<OfflineGameOptionsProps> = ({
    navigation,
    route,
}) => {
    const gameId = route.params.gameId
    const {
        theme: { colors, size },
    } = useTheme()
    const {
        mutateAsync: reenterGame,
        isLoading: reenterLoading,
        error: reenterError,
        reset: reenterReset,
    } = useReenterGame()
    const {
        mutateAsync: pushOfflineGame,
        isLoading: pushLoading,
        error: pushError,
        reset: pushReset,
    } = usePushFullGame()

    const { data: game } = useQuery(['getOfflineGameById', { gameId }], () =>
        getOfflineGameById(gameId),
    )

    const pushGame = async () => {
        try {
            reenterReset()
            await pushOfflineGame(gameId)
            navigation.navigate('ActiveGames')
        } catch {}
    }

    const onReenterGame = async () => {
        try {
            pushReset()
            if (game) {
                await reenterGame({
                    gameId: game._id,
                    teamId: game.teamOne._id,
                })
            }
        } catch {}
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
                        loading={pushLoading}
                        disabled={pushLoading}
                        onPress={pushGame}
                    />
                    {pushError && (
                        <Text style={styles.errorText}>
                            {pushError.message}
                        </Text>
                    )}
                    {reenterError && (
                        <Text style={styles.errorText}>
                            {reenterError.message}
                        </Text>
                    )}
                    <SecondaryButton
                        style={styles.button}
                        text="reactivate"
                        loading={reenterLoading}
                        onPress={onReenterGame}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default OfflineGameOptionsScreen
