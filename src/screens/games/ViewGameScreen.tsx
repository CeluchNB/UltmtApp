import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import PointAccordionGroup from '../../components/organisms/PointAccordionGroup'
import React from 'react'
import { ServerAction } from '../../types/action'
import { ViewGameProps } from '../../types/navigation'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useColors, useGameViewer } from '../../hooks'

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
        onSelectAction,
        onSelectPoint,
    } = useGameViewer(gameId)

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

    const styles = StyleSheet.create({
        pointsContainer: {
            marginTop: 10,
            height: '85%',
        },
    })

    return (
        <BaseScreen containerWidth="100%">
            {game && <GameHeader game={game} />}
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
                        onNextPoint={() => {}}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default ViewGameScreen
