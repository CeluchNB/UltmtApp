import { LiveGameContext } from '../../context/live-game-context'
import { createGuest } from '../../services/data/team'
import { updateInGameStatsPlayers } from '../../utils/in-game-stats'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'

export const useAddGuest = (teamId: string) => {
    const realm = useRealm()
    const { game } = useContext(LiveGameContext)

    const { mutateAsync, isLoading, isError, error } = useMutation(
        (player: { firstName: string; lastName: string }) =>
            createGuest(teamId, player.firstName, player.lastName, true),
        {
            onSuccess: team => {
                realm.write(() => {
                    game.teamOnePlayers = []
                    const newPlayers = updateInGameStatsPlayers(
                        game.teamOnePlayers,
                        team.players,
                    )
                    for (const player of newPlayers) {
                        game.teamOnePlayers.push(player)
                    }
                })
            },
        },
    )

    return { mutateAsync, isLoading, error, isError }
}
