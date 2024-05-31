import { GuestUser } from '../../types/user'
import { LiveGameContext } from '../../context/live-game-context'
import { createGuest } from '../../services/network/team'
import { updateInGameStatsPlayers } from '../../utils/in-game-stats'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'
import { withToken } from '../../services/data/auth'

export const useAddGuest = (teamId: string) => {
    const realm = useRealm()
    const { game } = useContext(LiveGameContext)

    return useMutation(async (player: GuestUser) => {
        const response = await withToken(createGuest, teamId, {
            firstName: player.firstName,
            lastName: player.lastName,
        })

        const { team } = response.data

        // TOOD: GAME-REFACTOR update separately saved team?
        realm.write(() => {
            game.teamOnePlayers = []
            const newPlayers = updateInGameStatsPlayers(
                game.teamOnePlayers,
                team.players,
            )
            for (const newPlayer of newPlayers) {
                game.teamOnePlayers.push(newPlayer)
            }
        })
    })
}
