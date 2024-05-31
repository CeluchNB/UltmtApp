import { ActionSchema } from '../../models'
import { LiveGameContext } from '../../context/live-game-context'
import { handleUndoActionSideEffects } from '../../services/data/live-action'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useQuery, useRealm } from '../../context/realm'

export const useUndoAction = () => {
    const { point } = useContext(LiveGameContext)
    const realm = useRealm()
    const actionQuery = useQuery<ActionSchema>(
        {
            type: 'Action',
            query: collection => {
                return collection
                    .filtered('pointId == $0', point._id)
                    .sorted('actionNumber', true)
            },
        },
        [point._id],
    )

    return useMutation(async () => {
        if (!actionQuery || actionQuery.length < 1) return

        realm.write(() => {
            handleUndoActionSideEffects(actionQuery[0], point)
            realm.delete(actionQuery[0])
        })
    })
}
