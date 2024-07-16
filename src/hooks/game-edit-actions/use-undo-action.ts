import { ActionSchema } from '../../models'
import { LiveGameContext } from '../../context/live-game-context'
import { handleUndoActionSideEffects } from '../../services/data/live-action'
import { parseAction } from '../../utils/action'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'

export const useUndoAction = () => {
    const { point } = useContext(LiveGameContext)
    const realm = useRealm()

    return useMutation(async () => {
        if (!point) return

        const actions = realm
            .objects<ActionSchema>('Action')
            .filtered('pointId == $0', point._id)
            .sorted('actionNumber', true)
        if (actions.length < 1) return

        // This convoluted method appears to fix the undo error where
        // actions were sometimes not deleted. Continue to monitor
        const { _id } = actions[0]
        const action = realm.objectForPrimaryKey<ActionSchema>('Action', _id)
        if (!action) return

        const { actionNumber } = action
        realm.write(() => {
            handleUndoActionSideEffects(parseAction(actions[0]), point)
            realm.delete(action)
        })

        return actionNumber
    })
}
