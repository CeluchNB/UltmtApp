import { LiveGameContext } from '../../context/live-game-context'
import { backPoint } from '../../services/network/point'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { withGameToken } from '../../services/data/game'
import { ActionSchema, PointSchema } from '../../models'
import { useObject, useQuery, useRealm } from './../../context/realm'

export const useBackPoint = (currentPointId: string) => {
    const realm = useRealm()
    const point = useObject<PointSchema>('Point', currentPointId)
    const actions = useQuery<ActionSchema>('Action', a => {
        return a.filtered(`pointId == $0`, currentPointId)
    })
    const { team, setCurrentPointNumber } = useContext(LiveGameContext)

    const { mutateAsync, isLoading, error } = useMutation(
        async () => {
            // TODO: GAME-REFACTOR ensure network error correctly passed to error prop
            const response = await withGameToken(backPoint, point?.pointNumber)

            const { point: pointResponse, actions: actionsResponse } =
                response.data

            realm.write(() => {
                realm.delete(actions)
                const schema = new PointSchema(pointResponse)
                realm.create('Point', schema)

                for (const action of actionsResponse) {
                    const actionSchema = new ActionSchema(
                        { ...action, teamNumber: team },
                        action.pointId,
                        new Realm.BSON.ObjectId(action._id),
                    )
                    realm.create('Action', actionSchema)
                }
            })
            setCurrentPointNumber(pointResponse.pointNumber)

            return { pointResponse, actionsResponse }
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
        backPoint: mutateAsync,
        isLoading,
        error,
    }
}
