import * as Constants from '../../utils/constants'
import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { OfflineGameOptionsProps } from '../../types/navigation'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import SecondaryButton from '../../components/atoms/SecondaryButton'
import { size } from '../../theme/fonts'
import { useGameReactivation } from '../../hooks/useGameReactivation'
import { StyleSheet, Text, View } from 'react-native'
import { getOfflineGameById, pushOfflineGame } from '../../services/data/game'
import { useColors, useData } from '../../hooks'

const OfflineGameOptionsScreen: React.FC<OfflineGameOptionsProps> = ({
    navigation,
    route,
}) => {
    const gameId = route.params.gameId
    const { colors } = useColors()
    const { navigateToGame } = useGameReactivation()
    const { data: game } = useData(getOfflineGameById, gameId)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const pushGame = async () => {
        setLoading(true)
        try {
            await pushOfflineGame(gameId)
            navigation.navigate('ActiveGames')
        } catch (e: any) {
            setError(e?.message ?? Constants.FINISH_GAME_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const reactivateGame = async () => {
        navigateToGame(game)
    }

    const styles = StyleSheet.create({
        button: {
            marginTop: 10,
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontMedium,
        },
    })
    return (
        <BaseScreen containerWidth="80%">
            {game && (
                <View>
                    <GameHeader game={game} />
                    <PrimaryButton
                        style={styles.button}
                        text="Push to Cloud"
                        loading={loading}
                        disabled={loading}
                        onPress={pushGame}
                    />
                    {error.length > 0 && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}
                    <SecondaryButton
                        style={styles.button}
                        text="Reactivate"
                        loading={false}
                        onPress={reactivateGame}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default OfflineGameOptionsScreen
