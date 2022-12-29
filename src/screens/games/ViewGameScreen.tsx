import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import PointAccordionGroup from '../../components/organisms/PointAccordionGroup'
import React from 'react'
import { ServerAction } from '../../types/action'
import { ViewGameProps } from '../../types/navigation'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useColors, useGameViewer } from '../../hooks'

const ViewGameScreen: React.FC<ViewGameProps> = ({ route }) => {
    const { colors } = useColors()
    const {
        params: { gameId },
    } = route

    const {
        game,
        points,
        gameLoading,
        loading,
        displayedActions,
        onSelectPoint,
    } = useGameViewer(gameId)

    const onSelectAction = (action: ServerAction) => {
        console.log('action', action)
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
                        loading={loading}
                        displayedActions={displayedActions}
                        onSelectPoint={onSelectPoint}
                        onSelectAction={onSelectAction}
                        onNextPoint={() => {}}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default ViewGameScreen
