import { ActiveGamesProps } from '../types/navigation'
import BaseScreen from '../components/atoms/BaseScreen'
import ConfirmModal from '../components/molecules/ConfirmModal'
import GameListItem from '../components/atoms/GameListItem'
import { GameSchema } from '../models'
import React from 'react'
import { getUserId } from '../services/data/user'
import { parseGame } from '../services/local/game'
import { useDeleteGame } from '../hooks/game-edit-actions/use-delete-game'
import { useQuery as useLocalQuery } from '../context/realm'
import { useQuery } from 'react-query'
import { useReenterGame } from '../hooks/game-edit-actions/use-reenter-game'
import { useTheme } from '../hooks'
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native'
import { Game, GameStatus, LocalGame } from '../types/game'

const ActiveGamesScreen: React.FC<ActiveGamesProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const {
        mutateAsync: deleteGame,
        isLoading: deleteLoading,
        error: deleteError,
        reset: deleteReset,
    } = useDeleteGame()
    const {
        mutateAsync: reenterGame,
        error: reenterError,
        isLoading: reenterLoading,
        reset: reenterReset,
    } = useReenterGame()

    const { data: userId } = useQuery(['getUserId'], () => getUserId(), {
        cacheTime: 0,
    })
    const games = useLocalQuery<GameSchema>('Game').filtered(
        'creator._id == $0',
        userId,
    )
    console.log('games', games)

    const [modalVisible, setModalVisible] = React.useState(false)
    const [deletingGame, setDeletingGame] = React.useState<Game>()

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
        try {
            if (
                activeGame.offline &&
                activeGame.teamOneStatus !== GameStatus.ACTIVE
            ) {
                navigation.navigate('OfflineGameOptions', {
                    gameId: activeGame._id,
                })
                return
            }

            await reenterGame({
                gameId: activeGame._id,
                teamId: getMyTeamId(activeGame),
            })
        } catch {}
    }

    const onDelete = async () => {
        try {
            reenterReset()
            if (deletingGame) {
                await deleteGame({
                    gameId: deletingGame._id,
                    teamId: getMyTeamId(deletingGame),
                })
                setModalVisible(false)
            }
        } catch {}
    }

    const onClose = async () => {
        deleteReset()
        setModalVisible(false)
    }

    const styles = StyleSheet.create({
        infoText: {
            fontSize: size.fontThirty,
            color: colors.gray,
        },
        list: { marginTop: 10 },
        error: {
            fontSize: size.fontFifteen,
            color: colors.error,
        },
    })

    return (
        <BaseScreen containerWidth={80}>
            {!games ||
                (games?.length === 0 && (
                    <Text style={styles.infoText}>No active games</Text>
                ))}
            {reenterError && (
                <Text style={styles.error}>{reenterError.toString()}</Text>
            )}
            {reenterLoading && <ActivityIndicator color={colors.textPrimary} />}
            <FlatList
                style={styles.list}
                data={games.map(g => parseGame(g))}
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
                confirmColor={colors.textPrimary}
                error={deleteError}
            />
        </BaseScreen>
    )
}

export default ActiveGamesScreen
