import { ApiError } from '../../types/services'
import { DisplayUser } from '../../types/user'
import { PointSchema } from '../../models'
import { setPlayers as networkSetPlayers } from '../../services/network/point'
import { useMutation } from 'react-query'
import { withGameToken } from '../../services/data/game'
import { useObject, useRealm } from '../../context/realm'

export const useSetPlayers = (
    pointId: string,
    players: DisplayUser[],
    onPullingTeamMismatch: () => void,
) => {
    const realm = useRealm()
    const point = useObject<PointSchema>('Point', pointId)

    return useMutation<void, ApiError>(async () => {
        if (!point) return

        const response = await withGameToken(
            networkSetPlayers,
            pointId,
            players,
        )

        const { point: pointResponse } = response.data

        realm.write(() => {
            point.teamOnePlayers = pointResponse.teamOnePlayers
            point.teamTwoPlayers = pointResponse.teamTwoPlayers
            point.teamOneActivePlayers = pointResponse.teamOneActivePlayers
            point.teamTwoActivePlayers = pointResponse.teamTwoActivePlayers
        })

        if (pointResponse.pullingTeam._id !== point.pullingTeam._id) {
            onPullingTeamMismatch()
            throw new Error()
        }
    })
}
