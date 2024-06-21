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

export const useReenterGame = () => {
    const realm = useRealm()
    const navigate = useNavigation()

    return useMutation(
        async ({ gameId, teamId }: { gameId: string; teamId: string }) => {
            const response = await withToken(reenterGame, gameId, teamId)

            const { game, point, actions, token } = response.data

            // TODO: GAME-REFACTOR stats not working on reenter
            const statsResponse = await getGameStats(gameId)
            const gameStats = statsResponse.data
            const statsPoints = populateInGameStats(
                gameStats.game,
                game.teamOne._id === teamId
                    ? game.teamOnePlayers
                    : game.teamTwoPlayers,
            )

            await EncryptedStorage.setItem('game_token', token)
            const gameSchema = new GameSchema(game, false, statsPoints)
            const team = gameSchema.teamOne._id === teamId ? 'one' : 'two'

            realm.write(() => {
                realm.create('Game', gameSchema, UpdateMode.All)
                if (!point) return

                const pointSchema = new PointSchema(point)
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
