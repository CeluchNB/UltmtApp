import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import GameUtilityBar from '../../components/molecules/GameUtilityBar'
import PointAccordionGroup from '../../components/organisms/PointAccordionGroup'
import React from 'react'
import { ServerAction } from '../../types/action'
import { ViewGameProps } from '../../types/navigation'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useColors, useGameReactivation, useGameViewer } from '../../hooks'

const ViewGameScreen: React.FC<ViewGameProps> = ({ navigation, route }) => {
    const {
        params: { gameId },
    } = route

    const { colors } = useColors()
    const {
        activePoint,
        allPointsLoading,
        game,
        points,
        gameLoading,
        loading,
        displayedActions,
        managingTeamId,
        onSelectAction,
        onSelectPoint,
        onReactivateGame,
    } = useGameViewer(gameId)
    const { navigateToGame } = useGameReactivation()

    React.useEffect(() => {
        const removeListener = navigation.addListener('focus', async () => {
            if (activePoint) {
                await onSelectPoint(activePoint._id)
            }
        })
        return () => {
            removeListener()
        }
    }, [activePoint, navigation, onSelectPoint])

    const handleSelectAction = (action: ServerAction) => {
        const { pointId, live } = onSelectAction(action)
        navigation.navigate('Comment', {
            gameId,
            live,
            pointId,
        })
    }

    const handleReactivateGame = React.useCallback(async () => {
        if (!onReactivateGame) {
            return undefined
        }
        const reactivatedGame = await onReactivateGame()
        if (reactivatedGame) {
            navigateToGame(reactivatedGame)
        }
    }, [navigateToGame, onReactivateGame])

    const styles = StyleSheet.create({
        pointsContainer: {
            marginTop: 10,
            height: '80%',
            backgroundColor: colors.primary,
        },
    })

    return (
        <BaseScreen containerWidth="90%">
            {game && <GameHeader game={game} />}
            {game && (
                <GameUtilityBar
                    onReactivateGame={
                        managingTeamId ? handleReactivateGame : undefined
                    }
                />
            )}
            {(allPointsLoading || gameLoading) && (
                <ActivityIndicator color={colors.textPrimary} />
            )}
            {points && (
                <View style={styles.pointsContainer}>
                    <PointAccordionGroup
                        activePointId={activePoint?._id}
                        points={points.sort(
                            (a, b) => b.pointNumber - a.pointNumber,
                        )}
                        teamOne={game?.teamOne || { name: '' }}
                        teamTwo={game?.teamTwo || { name: '' }}
                        loading={loading}
                        displayedActions={displayedActions}
                        onSelectPoint={onSelectPoint}
                        onSelectAction={handleSelectAction}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default ViewGameScreen
