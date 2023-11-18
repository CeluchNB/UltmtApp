import { ActiveGamesProps } from '../types/navigation'
import BaseScreen from '../components/atoms/BaseScreen'
import ConfirmModal from '../components/molecules/ConfirmModal'
import GameListItem from '../components/atoms/GameListItem'
import React from 'react'
import { getUserId } from '../services/data/user'
import { useQuery } from 'react-query'
import { FlatList, StyleSheet, Text } from 'react-native'
import { Game, LocalGame } from '../types/game'
import { deleteGame, getActiveGames } from '../services/data/game'
import { useGameReactivation, useTheme } from '../hooks'

const ActiveGamesScreen: React.FC<ActiveGamesProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const { onReactivateGame } = useGameReactivation()
    const { data: userId } = useQuery(['getUserId'], () => getUserId(), {
        cacheTime: 0,
    })
    const { data: games, refetch } = useQuery<(Game & { offline: boolean })[]>(
        ['getActiveGames'],
        () => getActiveGames(),
        { cacheTime: 0 },
    )
    const [modalVisible, setModalVisible] = React.useState(false)
    const [deletingGame, setDeletingGame] = React.useState<Game>()
    const [deleteLoading, setDeleteLoading] = React.useState(false)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            refetch()
        })
        return () => {
            unsubscribe()
        }
    }, [navigation, refetch])

    const getMyTeamId = React.useCallback(
        (game: Game): string => {
            return (
                (game.creator._id === userId
                    ? game.teamOne._id
                    : game.teamTwo._id) || ''
            )
        },
        [userId],
    )

    const onGamePress = async (activeGame: LocalGame) => {
        // get game data
        try {
            if (activeGame.offline && !activeGame.teamOneActive) {
                navigation.navigate('OfflineGameOptions', {
                    gameId: activeGame._id,
                })
                return
            }

            await onReactivateGame(activeGame._id, getMyTeamId(activeGame))
        } catch (e) {
            // TODO: error display?
        }
    }

    const onDelete = async () => {
        if (deletingGame) {
            setDeleteLoading(true)
            try {
                await deleteGame(deletingGame._id, getMyTeamId(deletingGame))
            } catch (e) {
                // TODO: error display do nothing
            } finally {
                refetch()
                setDeleteLoading(false)
            }
        }
        setModalVisible(false)
    }

    const onClose = async () => {
        setModalVisible(false)
    }

    const styles = StyleSheet.create({
        infoText: {
            fontSize: size.fontThirty,
            color: colors.gray,
        },
        list: { marginTop: 10 },
    })

    return (
        <BaseScreen containerWidth={80}>
            {!games ||
                (games?.length === 0 && (
                    <Text style={styles.infoText}>No active games</Text>
                ))}
            <FlatList
                style={styles.list}
                data={games}
                renderItem={({ item }) => {
                    return (
                        <GameListItem
                            game={item}
                            teamId={getMyTeamId(item)}
                            showDelete={true}
                            onPress={() => {
                                onGamePress(item)
                            }}
                            onDelete={() => {
                                setDeletingGame(item)
                                setModalVisible(true)
                            }}
                        />
                    )
                }}
            />
            <ConfirmModal
                displayText="Are you sure you want to delete the game? This cannot be undone."
                visible={modalVisible}
                loading={deleteLoading}
                onClose={onClose}
                onCancel={onClose}
                onConfirm={onDelete}
            />
        </BaseScreen>
    )
}

export default ActiveGamesScreen
