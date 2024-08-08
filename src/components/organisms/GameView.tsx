import BaseScreen from '../atoms/BaseScreen'
import ConfirmModal from '../molecules/ConfirmModal'
import GameHeader from '../molecules/GameHeader'
import GameLeadersScene from './GameLeadersScene'
import GameUtilityBar from '../molecules/GameUtilityBar'
import { GameViewContext } from '../../context/game-view-context'
import ViewPointsScene from './ViewPointsScene'
import { exportGameStats } from '../../services/data/stats'
import { setupMobileAds } from '../../utils/ads'
import { useDeleteGame } from '../../hooks/game-edit-actions/use-delete-game'
import { useNavigation } from '@react-navigation/native'
import { useReenterGame } from '../../hooks/game-edit-actions/use-reenter-game'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import React, { useContext } from 'react'
import { TabBar, TabView } from 'react-native-tab-view'

interface GameViewProps {
    gameId: string
}

const renderScene = (
    gameId: string,
    teamOneName?: string,
    teamTwoName?: string,
) => {
    return ({ route }: { route: { key: string } }) => {
        switch (route.key) {
            case 'points':
                return <ViewPointsScene gameId={gameId} />
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

const GameView: React.FC<GameViewProps> = ({ gameId }) => {
    const layout = useWindowDimensions()
    const navigation = useNavigation()

    const {
        theme: { colors, size },
    } = useTheme()

    const mapTabNameToIndex = (name: 'points' | 'stats'): number => {
        switch (name) {
            case 'points':
                return 0
            case 'stats':
                return 1
        }
    }

    const {
        userId,
        activePoint,
        allPointsLoading,
        game,
        gameLoading,
        managingTeamId,
        onSelectPoint,
    } = useContext(GameViewContext)

    const {
        mutateAsync: deleteGame,
        isLoading: deleteLoading,
        error: deleteError,
        reset: deleteReset,
    } = useDeleteGame()
    const {
        mutateAsync: reenterGame,
        isLoading: reactivateLoading,
        error: reenterError,
        reset: reenterReset,
    } = useReenterGame()

    const [deleteModalVisible, setDeleteModalVisible] = React.useState(false)
    const [exportModalVisible, setExportModalVisible] = React.useState(false)
    const [exportLoading, setExportLoading] = React.useState(false)
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
                onSelectPoint(activePoint._id)
            }
        })
        return () => {
            removeListener()
        }
    }, [activePoint, navigation, onSelectPoint])

    const handleReactivateGame = async () => {
        try {
            if (!game || !managingTeamId) {
                return undefined
            }

            await reenterGame({ gameId: game._id, teamId: managingTeamId })
        } catch {}
    }

    const onDelete = () => {
        setDeleteModalVisible(true)
    }

    const onExport = () => {
        setExportModalVisible(true)
    }

    const handleDeleteGame = async () => {
        if (!managingTeamId) return
        try {
            await deleteGame({ gameId, teamId: managingTeamId })
            setDeleteModalVisible(false)
            navigation.goBack()
        } catch {}
    }

    const handleExportStats = React.useCallback(async () => {
        try {
            if (!managingTeamId) return

            setExportLoading(true)
            await exportGameStats(userId ?? '', gameId)
        } catch (e) {
            // TODO: error display?
        } finally {
            setExportLoading(false)
            setExportModalVisible(false)
        }
    }, [gameId, managingTeamId, userId])

    const onDeleteModalClose = async () => {
        deleteReset()
        setDeleteModalVisible(false)
    }

    const onExportModalClose = async () => {
        reenterReset()
        setExportModalVisible(false)
    }

    const styles = StyleSheet.create({
        tabContainer: {
            height: '100%',
        },
        error: {
            color: colors.error,
            fontSize: size.fontFifteen,
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
                        onExportStats={managingTeamId ? onExport : undefined}
                        onReactivateGame={
                            managingTeamId ? handleReactivateGame : undefined
                        }
                        onDeleteGame={managingTeamId ? onDelete : undefined}
                    />
                )}
                {reenterError && (
                    <Text style={styles.error}>{reenterError.toString()}</Text>
                )}
                {(allPointsLoading || gameLoading) && (
                    <ActivityIndicator color={colors.textPrimary} />
                )}
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene(
                        gameId,
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
                confirmColor={colors.textPrimary}
                displayText="Are you sure you want to delete the game? This cannot be undone."
                visible={deleteModalVisible}
                onClose={onDeleteModalClose}
                onCancel={onDeleteModalClose}
                loading={deleteLoading}
                onConfirm={handleDeleteGame}
                error={deleteError}
            />
            <ConfirmModal
                displayText="This will send a spreadsheet to your email. Export stats?"
                loading={exportLoading}
                visible={exportModalVisible}
                confirmColor={colors.textPrimary}
                onClose={onExportModalClose}
                onCancel={onExportModalClose}
                onConfirm={handleExportStats}
            />
        </BaseScreen>
    )
}

export default GameView
