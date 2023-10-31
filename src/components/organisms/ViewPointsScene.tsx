import PointAccordionGroup from './PointAccordionGroup'
import React from 'react'
import { ServerActionData } from '../../types/action'
import { useNavigation } from '@react-navigation/native'
import { GameViewerData, useTheme } from '../../hooks'
import { StyleSheet, View } from 'react-native'

interface ViewPointsScene {
    gameId: string
    gameViewerData: GameViewerData
}

const ViewPointsScene: React.FC<ViewPointsScene> = ({
    gameId,
    gameViewerData,
}) => {
    const navigation = useNavigation()

    const {
        theme: { colors },
    } = useTheme()
    const {
        activePoint,
        game,
        loading,
        displayedActions,
        error,
        points,
        onSelectAction,
        onSelectPoint,
        onRefresh,
    } = gameViewerData

    const handleSelectAction = (action: ServerActionData) => {
        const { pointId, live } = onSelectAction(action)
        navigation.navigate('Tabs', {
            screen: 'Games',
            params: {
                screen: 'Comment',
                params: {
                    gameId,
                    live,
                    pointId,
                },
            },
        })
    }

    const styles = StyleSheet.create({
        pointsContainer: {
            marginTop: 10,
            height: '95%',
            backgroundColor: colors.primary,
        },
        container: { height: '100%' },
    })

    return (
        <View style={styles.container}>
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
                        error={error}
                        onSelectPoint={onSelectPoint}
                        onSelectAction={handleSelectAction}
                        onRefresh={onRefresh}
                    />
                </View>
            )}
        </View>
    )
}

export default ViewPointsScene
