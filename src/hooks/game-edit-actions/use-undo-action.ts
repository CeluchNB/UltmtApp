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
        'Action',
        actions => {
            return actions
                .filtered('pointId == $0', point._id)
                .sorted('actionNumber', true)
        },
        [point._id],
    )

    const { mutateAsync, isLoading } = useMutation(async () => {
        if (!actionQuery || actionQuery.length < 1) return

        realm.write(() => {
            handleUndoActionSideEffects(actionQuery[0], point)
            realm.delete(actionQuery[0])
        })
    })

    return {
        mutateAsync,
        isLoading,
    }
}
