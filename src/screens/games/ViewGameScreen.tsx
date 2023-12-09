import BaseScreen from '../../components/atoms/BaseScreen'
import ConfirmModal from '../../components/molecules/ConfirmModal'
import GameHeader from '../../components/molecules/GameHeader'
import GameLeadersScene from '../../components/organisms/GameLeadersScene'
import GameUtilityBar from '../../components/molecules/GameUtilityBar'
import React from 'react'
import { ViewGameProps } from '../../types/navigation'
import ViewPointsScene from '../../components/organisms/ViewPointsScene'
import { deleteGame } from '../../services/data/game'
import { setupMobileAds } from '../../utils/ads'
import {
    ActivityIndicator,
    StyleSheet,
    View,
    useWindowDimensions,
} from 'react-native'
import {
    GameViewerData,
    useGameReactivation,
    useGameViewer,
    useTheme,
} from '../../hooks'
import { TabBar, TabView } from 'react-native-tab-view'

const renderScene = (
    gameId: string,
    gameViewerData: GameViewerData,
    teamOneName?: string,
    teamTwoName?: string,
) => {
    return ({ route }: { route: { key: string } }) => {
        switch (route.key) {
            case 'points':
                return (
                    <ViewPointsScene
                        gameId={gameId}
                        gameViewerData={gameViewerData}
                    />
                )
            case 'stats':
                return (
                    <GameLeadersScene
                        gameId={gameId}
                        teamOneName={teamOneName}
                        teamTwoName={teamTwoName}
                    />
                )
            default:
                return null
        }
    }
}

const ViewGameScreen: React.FC<ViewGameProps> = ({ navigation, route }) => {
    const layout = useWindowDimensions()

    const {
        params: { gameId },
    } = route

    const {
        theme: { colors },
    } = useTheme()

    const mapTabNameToIndex = (name: 'points' | 'stats'): number => {
        switch (name) {
            case 'points':
                return 0
            case 'stats':
                return 1
        }
    }

    const gameViewerData = useGameViewer(gameId)
    const {
        activePoint,
        allPointsLoading,
        game,
        gameLoading,
        managingTeamId,
        onSelectPoint,
    } = gameViewerData
    const { onReactivateGame } = useGameReactivation()
    const [modalVisible, setModalVisible] = React.useState(false)
    const [deleteLoading, setDeleteLoading] = React.useState(false)
    const [reactivateLoading, setReactivateLoading] = React.useState(false)
    const [index, setIndex] = React.useState(mapTabNameToIndex('points'))
    const [routes] = React.useState([
        { key: 'points', title: 'Points' },
        { key: 'stats', title: 'Overview' },
    ])

    React.useEffect(() => {
        setupMobileAds()
    }, [])

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

    const handleReactivateGame = React.useCallback(async () => {
        try {
            if (!onReactivateGame || !game || !managingTeamId) {
                return undefined
            }
            setReactivateLoading(true)

            await onReactivateGame(game._id, managingTeamId)
        } catch (e) {
            // TODO: error display?
        } finally {
            setReactivateLoading(false)
        }
    }, [onReactivateGame, game, managingTeamId])

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
        } catch (e) {
            // TODO: error display? do nothing
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
        tabContainer: {
            height: '100%',
        },
    })

    return (
        <BaseScreen containerWidth={90}>
            <View style={styles.tabContainer}>
                {game && <GameHeader game={game} header />}
                {game && (
                    <GameUtilityBar
                        loading={reactivateLoading}
                        totalViews={game.totalViews}
                        onReactivateGame={
                            managingTeamId ? handleReactivateGame : undefined
                        }
                        onDeleteGame={managingTeamId ? onDelete : undefined}
                    />
                )}
                {(allPointsLoading || gameLoading) && (
                    <ActivityIndicator color={colors.textPrimary} />
                )}
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene(
                        gameId,
                        gameViewerData,
                        game?.teamOne?.name,
                        game?.teamTwo?.name,
                    )}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    renderTabBar={props => {
                        return (
                            <TabBar
                                {...props}
                                style={{ backgroundColor: colors.primary }}
                                indicatorStyle={{
                                    backgroundColor: colors.textPrimary,
                                }}
                                activeColor={colors.textPrimary}
                                inactiveColor={colors.darkGray}
                            />
                        )
                    }}
                />
            </View>
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
