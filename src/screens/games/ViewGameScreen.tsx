import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import PointAccordionGroup from '../../components/organisms/PointAccordionGroup'
import React from 'react'
import { ServerAction } from '../../types/action'
import { ViewGameProps } from '../../types/navigation'
import { isLivePoint } from '../../utils/point'
import { useDispatch } from 'react-redux'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import {
    setLiveAction,
    setSavedAction,
    setTeams,
} from '../../store/reducers/features/action/viewAction'
import { useColors, useGameViewer } from '../../hooks'

const ViewGameScreen: React.FC<ViewGameProps> = ({ navigation, route }) => {
    const {
        params: { gameId },
    } = route

    const { colors } = useColors()
    const dispatch = useDispatch()
    const {
        activePoint,
        allPointsLoading,
        game,
        points,
        gameLoading,
        loading,
        displayedActions,
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

    const onSelectAction = (action: ServerAction) => {
        const live = isLivePoint(activePoint)
        if (live) {
            dispatch(
                setTeams({ teamOne: game?.teamOne, teamTwo: game?.teamTwo }),
            )
            dispatch(setLiveAction(action))
        } else {
            dispatch(setSavedAction(action))
        }
        navigation.navigate('Comment', {
            gameId,
            live,
            pointId: activePoint?._id || '',
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
