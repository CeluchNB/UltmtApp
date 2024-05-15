import { PointSchema } from '../../models'
import { TeamNumber } from '../../types/team'
import { nextPoint } from '../../services/network/point'
import { useMutation } from 'react-query'
import { withGameToken } from '../../services/data/game'
import { useObject, useRealm } from '../../context/realm'

export const useNextPoint = (currentPointId: string) => {
    const realm = useRealm()
    const point = useObject<PointSchema>('Point', currentPointId)

    const { mutateAsync } = useMutation(async (pullingTeam: TeamNumber) => {
        if (!point) return

        const response = await withGameToken(
            nextPoint,
            pullingTeam,
            point.pointNumber,
        )
        const { point: pointResponse } = response.data
        const schema = new PointSchema(pointResponse)
        realm.write(() => {
            realm.create('Point', schema)
            // TODO: GAME-REFACTOR would refer to delete the last point, try setting point before this
            // realm.delete(point)
        })
        return schema.pointNumber
    })

    return {
        nextPoint: mutateAsync,
    }
}
