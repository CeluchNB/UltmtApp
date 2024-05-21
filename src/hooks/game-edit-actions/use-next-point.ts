import { LiveGameContext } from '../../context/live-game-context'
import { TeamNumber } from '../../types/team'
import { nextPoint } from '../../services/network/point'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { withGameToken } from '../../services/data/game'
import { ActionSchema, PointSchema } from '../../models'
import { useQuery, useRealm } from '../../context/realm'

export const useNextPoint = (currentPointId: string) => {
    const realm = useRealm()
    const actions = useQuery<ActionSchema>('Action', a => {
        return a.filtered(`pointId == $0`, currentPointId)
    })
    const { game, point, setCurrentPointNumber } = useContext(LiveGameContext)

    const { mutateAsync, isLoading, error } = useMutation(
        async (pullingTeam: TeamNumber) => {
            if (!point) return

            // TODO: GAME-REFACTOR ensure network error correctly passed to error prop
            const response = await withGameToken(
                nextPoint,
                pullingTeam,
                point.pointNumber,
            )
            const { point: pointResponse } = response.data

            const schema = new PointSchema(pointResponse)
            realm.write(() => {
                realm.delete(actions)
                realm.create('Point', schema)

                game.teamOneScore = schema.teamOneScore
                game.teamTwoScore = schema.teamTwoScore
            })
            setCurrentPointNumber(pointResponse.pointNumber)

            return pointResponse
        },
        {
            onSuccess: () => {
                realm.write(() => {
                    realm.delete(point)
                })
            },
        },
    )

    return {
        nextPoint: mutateAsync,
        isLoading,
        error,
    }
}
