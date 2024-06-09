import { PointSchema } from '../../models'
import { TeamNumber } from '../../types/team'
import { UpdateMode } from 'realm'
import { nextPoint } from '../../services/network/point'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'
import { withGameToken } from '../../services/data/game'

export const useFirstPoint = () => {
    const realm = useRealm()

    return useMutation(async (pullingTeam: TeamNumber) => {
        const response = await withGameToken(nextPoint, pullingTeam, 0)
        const { point: pointResponse } = response.data

        const schema = new PointSchema(pointResponse)

        realm.write(() => {
            realm.create('Point', schema, UpdateMode.Modified)
        })
    })
}
