import { ActionSchema } from '../../models'
import { LiveGameContext } from '../../context/live-game-context'
import { LiveServerActionData } from '../../types/action'
import { handleCreateActionSideEffects } from '../../services/data/live-action'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'

export const useCreateAction = () => {
    const { point } = useContext(LiveGameContext)
    const realm = useRealm()

    return useMutation(async (action: LiveServerActionData) => {
        if (!point) return

        const schema = new ActionSchema(action, point._id)
        realm.write(() => {
            realm.create('Action', schema)
            handleCreateActionSideEffects(point, action)
        })
        return schema
    })
}
