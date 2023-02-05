import BaseScreen from '../../components/atoms/BaseScreen'
import ConfirmModal from '../../components/molecules/ConfirmModal'
import GameHeader from '../../components/molecules/GameHeader'
import GameUtilityBar from '../../components/molecules/GameUtilityBar'
import PointAccordionGroup from '../../components/organisms/PointAccordionGroup'
import React from 'react'
import { ServerAction } from '../../types/action'
import { ViewGameProps } from '../../types/navigation'
import { deleteGame } from '../../services/data/game'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useGameReactivation, useGameViewer, useTheme } from '../../hooks'

const ViewGameScreen: React.FC<ViewGameProps> = ({ navigation, route }) => {
    const {
        params: { gameId },
    } = route

    const {
        theme: { colors },
    } = useTheme()
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
    const [modalVisible, setModalVisible] = React.useState(false)
    const [deleteLoading, setDeleteLoading] = React.useState(false)

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

    const onDelete = () => {
        setModalVisible(true)
    }

    const handleDeleteGame = React.useCallback(async () => {
        setDeleteLoading(true)
        try {
            if (!managingTeamId) {
                throw new Error()
            }
            await deleteGame(gameId, managingTeamId)
        } finally {
            setDeleteLoading(false)
            setModalVisible(false)
            navigation.goBack()
        }
    }, [gameId, managingTeamId, navigation])

    const onClose = async () => {
        setModalVisible(false)
    }

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
                    onDeleteGame={managingTeamId ? onDelete : undefined}
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
            <ConfirmModal
                displayText="Are you sure you want to delete the game? This cannot be undone."
                visible={modalVisible}
                onClose={onClose}
                onCancel={onClose}
                loading={deleteLoading}
                onConfirm={handleDeleteGame}
            />
        </BaseScreen>
    )
}

export default ViewGameScreen
