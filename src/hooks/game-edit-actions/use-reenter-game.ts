import EncryptedStorage from 'react-native-encrypted-storage'
import { LiveGameWizardState } from '../../types/game'
import { UpdateMode } from 'realm'
import { getGameStats } from '../../services/network/stats'
import { populateInGameStats } from '../../utils/game'
import { reenterGame } from '../../services/network/game'
import { useMutation } from 'react-query'
import { useNavigation } from '@react-navigation/native'
import { useRealm } from '../../context/realm'
import { withToken } from '../../services/data/auth'
import { ActionSchema, GameSchema, PointSchema } from '../../models'
import {
    addInGameStatsPlayers,
    initializeInGameStatsPlayers,
} from '../../utils/in-game-stats'

export const useReenterGame = () => {
    const realm = useRealm()
    const navigate = useNavigation()

    return useMutation(
        async ({ gameId, teamId }: { gameId: string; teamId: string }) => {
            const response = await withToken(reenterGame, gameId, teamId)
            const { game, point, actions, token } = response.data

            const statsResponse = await getGameStats(gameId)
            const gameStats = statsResponse.data

            const statsPoints = populateInGameStats(
                gameStats.game,
                game.teamOne._id === teamId
                    ? game.teamOnePlayers
                    : game.teamTwoPlayers,
            )
            const players = addInGameStatsPlayers(
                initializeInGameStatsPlayers(
                    game.teamOne._id === teamId
                        ? game.teamOnePlayers
                        : game.teamTwoPlayers,
                ),
                statsPoints.map(playerPoints => playerPoints.pointStats).flat(),
            )

            const gameSchema = new GameSchema(game, false, statsPoints)
            const team = gameSchema.teamOne._id === teamId ? 'one' : 'two'
            if (team === 'one') {
                gameSchema.teamOnePlayers = players
            } else {
                gameSchema.teamTwoPlayers = players
            }

            await EncryptedStorage.setItem('game_token', token)
            realm.write(() => {
                realm.create('Game', gameSchema, UpdateMode.All)
                if (!point) return

                const pointSchema = new PointSchema(point)
                realm.create('Point', pointSchema, UpdateMode.All)

                // delete previously saved actions b/c IDs change
                const savedActions = realm
                    .objects('Action')
                    .filtered('pointId == $0', pointSchema._id)
                realm.delete(savedActions)

                for (const action of actions) {
                    realm.create(
                        'Action',
                        new ActionSchema(action, pointSchema._id),
                        UpdateMode.All,
                    )
                }
            })

            if (point) {
                navigate.navigate('LiveGame', {
                    screen: 'LiveGameEdit',
                    params: {
                        gameId,
                        team,
                        pointNumber: point.pointNumber,
                        state:
                            actions.length > 0
                                ? LiveGameWizardState.LOG_ACTIONS
                                : LiveGameWizardState.SET_PLAYERS,
                    },
                })
            } else {
                navigate.navigate('LiveGame', {
                    screen: 'FirstPoint',
                    params: {
                        gameId,
                        team,
                    },
                })
            }
        },
    )
}
