import { ActionSchema } from '../../models'
import { LiveGameContext } from '../../context/live-game-context'
import { handleCreateActionSideEffects } from '../../services/data/live-action'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { ClientActionData, LiveServerActionData } from '../../types/action'
import { useQuery, useRealm } from '../../context/realm'

export const useCreateAction = () => {
    const { game, point, team } = useContext(LiveGameContext)
    const realm = useRealm()

    const actionQuery = useQuery<ActionSchema>(
        {
            type: 'Action',
            query: collection => {
                return collection
                    .filtered('pointId == $0', point?._id)
                    .sorted('actionNumber', true)
            },
        },
        [point?._id],
    )

    const getActionData = (
        data: LiveServerActionData | ClientActionData,
    ): LiveServerActionData => {
        if (game?.offline) {
            const actionNumber =
                actionQuery.length < 1 ? 1 : actionQuery[0].actionNumber + 1
            return {
                ...data,
                actionNumber,
                teamNumber: team,
                comments: [],
            }
        } else {
            return data as LiveServerActionData
        }
    }

    return useMutation(
        async (data: LiveServerActionData | ClientActionData) => {
            if (!point) return

            const action = getActionData(data)

            const schema = new ActionSchema(action, point._id)
            realm.write(() => {
                realm.create('Action', schema)
                handleCreateActionSideEffects(point, action)
            })
            return schema
        },
    )
}
