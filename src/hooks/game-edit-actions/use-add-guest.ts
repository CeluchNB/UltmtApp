import { GuestUser } from '../../types/user'
import { LiveGameContext } from '../../context/live-game-context'
import { TeamSchema } from '../../models'
import { UpdateMode } from 'realm'
import { createGuest } from '../../services/network/team'
import { createGuestPlayer } from '../../utils/realm'
import { updateInGameStatsPlayers } from '../../utils/in-game-stats'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { withToken } from '../../services/data/auth'
import { useObject, useRealm } from '../../context/realm'

export const useAddGuest = (teamId: string) => {
    const realm = useRealm()
    const { game } = useContext(LiveGameContext)
    const team = useObject<TeamSchema>('Team', teamId)

    const onlineAddGuest = async (player: GuestUser) => {
        if (!game) return

        const response = await withToken(createGuest, teamId, {
            firstName: player.firstName,
            lastName: player.lastName,
        })

        const { team: teamResponse } = response.data

        const newPlayers = updateInGameStatsPlayers(
            game.teamOnePlayers.map(p => ({ ...p })),
            teamResponse.players,
        )

        realm.write(() => {
            game.teamOnePlayers = []

            for (const newPlayer of newPlayers) {
                game.teamOnePlayers.push(newPlayer)
            }

            const teamSchema = new TeamSchema(teamResponse)
            realm.create('Team', teamSchema, UpdateMode.Modified)
        })
    }

    return useMutation(async (player: GuestUser) => {
        if (!game) return

        if (game?.offline) {
            const guest = createGuestPlayer(player)

            const newPlayers = updateInGameStatsPlayers(game.teamOnePlayers, [
                ...game.teamOnePlayers,
                guest,
            ])
            realm.write(() => {
                for (const newPlayer of newPlayers) {
                    game.teamOnePlayers.push(newPlayer)
                }

                team?.players.push({
                    _id: guest._id,
                    firstName: guest.firstName,
                    lastName: guest.lastName,
                    username: guest.username,
                    localGuest: true,
                })
            })
        } else {
            await onlineAddGuest(player)
        }
    })
}
