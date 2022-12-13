import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import PointAccordionGroup from '../../components/organisms/PointAccordionGroup'
import React from 'react'
import { ViewGameProps } from '../../types/navigation'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { getGameById, getPointsByGame } from '../../services/data/game'
import { useColors, useData } from '../../hooks'

const ViewGameScreen: React.FC<ViewGameProps> = ({ route }) => {
    const { colors } = useColors()
    const {
        params: { gameId },
    } = route

    const {
        data: game,
        loading: gameLoading,
        refetch: updateGame,
    } = useData(getGameById, gameId)

    const { data: points, refetch: updatePoints } = useData(
        getPointsByGame,
        gameId,
    )

    const onNextPoint = () => {
        updateGame()
        updatePoints()
    }

    const styles = StyleSheet.create({
        pointsContainer: {
            marginTop: 10,
            height: '85%',
        },
    })

    return (
        <BaseScreen containerWidth="100%">
            {gameLoading && <ActivityIndicator color={colors.textPrimary} />}
            {game && <GameHeader game={game} />}
            {points && (
                <View style={styles.pointsContainer}>
                    <PointAccordionGroup
                        gameId={gameId}
                        points={points.sort(
                            (a, b) => b.pointNumber - a.pointNumber,
                        )}
                        teamOne={game?.teamOne || { name: '' }}
                        teamTwo={game?.teamTwo || { name: '' }}
                        onNextPoint={onNextPoint}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default ViewGameScreen
