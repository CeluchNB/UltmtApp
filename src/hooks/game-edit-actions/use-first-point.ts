import { ApiError } from '../../types/services'
import { TeamNumber } from '../../types/team'
import { UpdateMode } from 'realm'
import { nextPoint } from '../../services/network/point'
import { useMutation } from 'react-query'
import { withGameToken } from '../../services/data/game'
import { GameSchema, PointSchema } from '../../models'
import { useObject, useRealm } from '../../context/realm'

export const useFirstPoint = (gameId: string) => {
    const realm = useRealm()
    const game = useObject<GameSchema>('Game', gameId)

    const createOfflinePoint = async (pullingTeam: TeamNumber) => {
        if (!game) throw new ApiError('This game does not exist')

        const schema = PointSchema.createOfflinePoint({
            pointNumber: 1,
            teamOneScore: game.teamOneScore,
            teamTwoScore: game.teamTwoScore,
            pullingTeam:
                pullingTeam === 'one'
                    ? Object.assign({}, game.teamOne)
                    : Object.assign({}, game.teamTwo),
            receivingTeam:
                pullingTeam === 'one'
                    ? Object.assign({}, game.teamTwo)
                    : Object.assign({}, game.teamOne),
            gameId: game._id,
        })

        realm.write(() => {
            realm.create('Point', schema, UpdateMode.Modified)
        })
    }

    const createOnlinePoint = async (pullingTeam: TeamNumber) => {
        const response = await withGameToken(nextPoint, pullingTeam, 0)
        if (response.status !== 201) {
            throw new ApiError(response.data.message)
        }
        const { point: pointResponse } = response.data

        const schema = new PointSchema(pointResponse)
        realm.write(() => {
            realm.create('Point', schema, UpdateMode.Modified)
        })
    }

    return useMutation<void, ApiError, TeamNumber>(
        async (pullingTeam: TeamNumber) => {
            if (game?.offline) {
                await createOfflinePoint(pullingTeam)
            } else {
                await createOnlinePoint(pullingTeam)
            }
        },
    )
}
