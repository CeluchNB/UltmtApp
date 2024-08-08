import { LiveGameContext } from '../../context/live-game-context'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'

export const useSwitchPullingTeam = () => {
    const { point } = useContext(LiveGameContext)
    const realm = useRealm()

    return useMutation<void>(async () => {
        if (!point) return

        const receivingTeam = Object.assign({}, point.receivingTeam)
        realm.write(() => {
            point.receivingTeam = point.pullingTeam
            point.pullingTeam = receivingTeam
        })
    })
}
