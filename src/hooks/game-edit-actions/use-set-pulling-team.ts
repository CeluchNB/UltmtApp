import { LiveGameContext } from '../../context/live-game-context'
import { TeamNumber } from '../../types/team'
import { setPullingTeam } from '../../services/network/point'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'
import { withGameToken } from '../../services/data/game'

export const useSetPullingTeam = () => {
    const { point, game } = useContext(LiveGameContext)
    const realm = useRealm()

    const offlineSetPullingTeam = (team: TeamNumber) => {
        console.log('offline set', team)
        if (!point || !game) return

        console.log(
            'setting',
            team === 'one'
                ? Object.assign({}, game.teamOne)
                : Object.assign({}, game.teamTwo),
        )
        realm.write(() => {
            point.pullingTeam =
                team === 'one'
                    ? Object.assign({}, game.teamOne)
                    : Object.assign({}, game.teamTwo)
            point.receivingTeam =
                team === 'one'
                    ? Object.assign({}, game.teamTwo)
                    : Object.assign({}, game.teamOne)
        })
    }

    const onlineSetPullingTeam = async (team: TeamNumber) => {
        if (!point) return

        const response = await withGameToken(setPullingTeam, point._id, team)
        const { point: pointResponse } = response.data

        realm.write(() => {
            point.pullingTeam = pointResponse.pullingTeam
            point.receivingTeam = pointResponse.receivingTeam
        })
    }

    return useMutation(async (team: TeamNumber) => {
        if (!point) return

        if (game?.offline) {
            offlineSetPullingTeam(team)
        } else {
            await onlineSetPullingTeam(team)
        }
    })
}
