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

const renderScene = (gameId: string, gameViewerData: GameViewerData) => {
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
                return <GameLeadersScene gameId={gameId} />
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
        myTeamActive,
        onSelectPoint,
        onReactivateGame,
    } = gameViewerData
    const { navigateToGame, onResurrect } = useGameReactivation()
    const [modalVisible, setModalVisible] = React.useState(false)
    const [deleteLoading, setDeleteLoading] = React.useState(false)
    const [reactivateLoading, setReactivateLoading] = React.useState(false)
    const [index, setIndex] = React.useState(mapTabNameToIndex('points'))
    const [routes] = React.useState([
        { key: 'points', title: 'Points' },
        { key: 'stats', title: 'Overview' },
    ])
    const [tabHeight, setTabHeight] = React.useState(0)

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
            if (!onReactivateGame) {
                return undefined
            }
            setReactivateLoading(true)

            let reactivatedGame
            if (game && myTeamActive) {
                // resurrect game if live
                reactivatedGame = await onResurrect(game)
            } else {
                // reactivate game if finished
                reactivatedGame = await onReactivateGame()
            }
            setReactivateLoading(false)
            if (reactivatedGame) {
                navigateToGame(reactivatedGame)
            }
        } catch (e) {
            // TODO: error display?
        } finally {
            setReactivateLoading(false)
        }
    }, [navigateToGame, onReactivateGame, game, onResurrect, myTeamActive])

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
            // do nothing
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
            height: tabHeight,
        },
    })

    return (
        <BaseScreen containerWidth={90}>
            {game && <GameHeader game={game} header />}
            {game && (
                <GameUtilityBar
                    loading={reactivateLoading}
                    onReactivateGame={
                        managingTeamId ? handleReactivateGame : undefined
                    }
                    onDeleteGame={managingTeamId ? onDelete : undefined}
                />
            )}
            {(allPointsLoading || gameLoading) && (
                <ActivityIndicator color={colors.textPrimary} />
            )}
            <View
                style={styles.tabContainer}
                onLayout={event => {
                    // TODO: this is not good enough, need to calculate height better
                    setTabHeight(layout.height - event.nativeEvent.layout.y)
                }}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene(gameId, gameViewerData)}
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
