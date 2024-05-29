import { ApiError } from '../../types/services'
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
                return collection.filtered('gameId == $0', gameId)
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
                    pointQuery.map(point => `"${point._id}"`),
                )
            },
        },
        [pointQuery],
    )

    return useMutation<undefined, ApiError>(
        async () => {
            if (game.offline) {
            } else {
                const response = await withGameToken(finishGame)
                if (response.status !== 200) {
                    throw new ApiError(response.data.message)
                }

                realm.write(() => {
                    realm.delete(actions)
                    realm.delete(pointQuery)
                    realm.delete(game)
                })
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
