import { ActionType } from '../../types/action'
import { ApiError } from '../../types/services'
import { GameStatus } from '../../types/game'
import { PointStatus } from '../../types/point'
import { finishGame } from '../../services/network/game'
import { useMutation } from 'react-query'
import { useNavigation } from '@react-navigation/native'
import { withGameToken } from '../../services/data/game'
import { ActionSchema, GameSchema, PointSchema } from '../../models'
import { useQuery, useRealm } from '../../context/realm'

export const useFinishGame = (gameId: string) => {
    const navigation = useNavigation()
    const realm = useRealm()
    const game = useQuery<GameSchema>('Game').filtered(`_id == '${gameId}'`)[0]
    const pointQuery = useQuery<PointSchema>(
        {
            type: 'Point',
            query: collection => {
                return collection
                    .filtered('gameId == $0', gameId)
                    .sorted('pointNumber', true)
            },
        },
        [gameId],
    )
    const actions = useQuery<ActionSchema>(
        {
            type: 'Action',
            query: collection => {
                return collection.filtered(
                    'pointId IN $0',
                    pointQuery.map(point => point._id),
                )
            },
        },
        [pointQuery],
    )

    const offlineFinishGame = () => {
        if (pointQuery.length < 0) return

        const lastPoint = pointQuery[0]
        const lastAction = actions
            .filter(a => a.pointId === lastPoint._id)
            .sort((a, b) => b.actionNumber - a.actionNumber)[0]

        let teamOneScore = 0
        let teamTwoScore = 0
        if (lastAction.actionType === ActionType.TEAM_ONE_SCORE) {
            teamOneScore += 1
        } else {
            teamTwoScore += 1
        }

        realm.write(() => {
            lastPoint.teamOneScore += teamOneScore
            lastPoint.teamTwoScore += teamTwoScore

            game.teamOneScore = lastPoint.teamOneScore
            game.teamTwoScore = lastPoint.teamTwoScore

            lastPoint.teamOneStatus = PointStatus.COMPLETE
            game.teamOneStatus = GameStatus.COMPLETE
        })
    }

    const onlineFinishGame = async () => {
        await withGameToken(finishGame)

        realm.write(() => {
            realm.delete(actions)
            realm.delete(pointQuery)
            realm.delete(game)
        })
    }

    return useMutation<undefined, ApiError>(
        async () => {
            if (game.offline) {
                offlineFinishGame()
            } else {
                await onlineFinishGame()
            }
        },
        {
            onSuccess: () => {
                navigation.navigate('Tabs', {
                    screen: 'Games',
                    params: { screen: 'GameHome' },
                })
            },
        },
    )
}
