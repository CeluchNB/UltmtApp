import { LiveGameContext } from '../../context/live-game-context'
import { TeamNumber } from '../../types/team'
import { setPullingTeam } from '../../services/network/point'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'
import { withGameToken } from '../../services/data/game'

export const useSetPullingTeam = () => {
    const { point } = useContext(LiveGameContext)
    const realm = useRealm()

    return useMutation(async (team: TeamNumber) => {
        const response = await withGameToken(setPullingTeam, point._id, team)
        const { point: pointResponse } = response.data

        realm.write(() => {
            point.pullingTeam = pointResponse.pullingTeam
            point.receivingTeam = pointResponse.receivingTeam
        })
    })
}
