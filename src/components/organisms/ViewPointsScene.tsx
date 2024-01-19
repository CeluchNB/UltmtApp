import { GameViewContext } from '../../context/game-view-context'
import PointAccordionGroup from './PointAccordionGroup'
import { ServerActionData } from '../../types/action'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import React, { useContext } from 'react'
import { StyleSheet, View } from 'react-native'

interface ViewPointsScene {
    gameId: string
}

const ViewPointsScene: React.FC<ViewPointsScene> = ({ gameId }) => {
    const navigation = useNavigation()

    const {
        theme: { colors },
    } = useTheme()

    const {
        activePoint,
        game,
        displayActions,
        activePointLoading: loading,
        points,
        pointError,
        onSelectPoint,
        onSelectAction,
        onRefresh,
    } = useContext(GameViewContext)

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
                        displayedActions={displayActions}
                        error={pointError}
                        onSelectPoint={onSelectPoint}
                        onSelectAction={handleSelectAction}
                        onRefresh={onRefresh} // TODO: set this up
                    />
                </View>
            )}
        </View>
    )
}

export default ViewPointsScene
