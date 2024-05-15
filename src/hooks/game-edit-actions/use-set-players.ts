import { DisplayUser } from '../../types/user'
import { PointSchema } from '../../models'
import { setPlayers as networkSetPlayers } from '../../services/network/point'
import { useMutation } from 'react-query'
import { withGameToken } from '../../services/data/game'
import { useObject, useRealm } from '../../context/realm'

export const useSetPlayers = (pointId: string, players: DisplayUser[]) => {
    const realm = useRealm()
    const point = useObject<PointSchema>('Point', pointId)

    const {
        mutateAsync: setPlayers,
        isLoading,
        error,
        isError,
    } = useMutation(async () => {
        // network call
        const response = await withGameToken(
            networkSetPlayers,
            pointId,
            players,
        )
        // local reconciliation
        const { point: pointResponse } = response.data
        if (point) {
            realm.write(() => {
                point.teamOnePlayers = pointResponse.teamOnePlayers
                point.teamTwoPlayers = pointResponse.teamTwoPlayers
                point.teamOneActivePlayers = pointResponse.teamOneActivePlayers
                point.teamTwoActivePlayers = pointResponse.teamTwoActivePlayers
            })
        }
    })

    return { setPlayers, isLoading, error, isError }
}
