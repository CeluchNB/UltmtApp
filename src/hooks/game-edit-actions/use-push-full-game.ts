import { ApiError } from '../../types/services'
import { CreateFullGame } from '../../types/game'
import { UpdateMode } from 'realm'
import { getManagedTeam } from '../../services/network/team'
import { parseClientAction } from '../../utils/action'
import { parseClientPoint } from '../../utils/point'
import { parseFullGame } from '../../utils/game'
import { pushOfflineGame } from '../../services/network/game'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'
import { withToken } from '../../services/data/auth'
import { ActionSchema, GameSchema, PointSchema, TeamSchema } from '../../models'
import { DisplayUser, InGameStatsUser } from '../../types/user'

export const usePushFullGame = () => {
    const realm = useRealm()

    const buildFullGame = (game: GameSchema): CreateFullGame => {
        const team = realm.objectForPrimaryKey<TeamSchema>(
            'Team',
            game.teamOne._id,
        )
        if (!team) throw new ApiError('Cannot get creating team')

        const points = realm
            .objects<PointSchema>('Point')
            .filtered('gameId == $0', game._id)

        const fullGame = parseFullGame(game)
        fullGame.teamOnePlayers = team.players

        for (const point of points) {
            const actions = realm
                .objects<ActionSchema>('Action')
                .filtered('pointId == $0', point._id)

            const fullPoint = parseClientPoint(point)

            fullPoint.actions = actions.map(a => parseClientAction(a))
            fullGame.points.push(fullPoint)
        }

        return fullGame
    }

    const replaceGuestsInLocalRecords = async (guests: DisplayUser[]) => {
        if (Object.keys(guests).length === 0) return

        const guestMap = new Map<string, DisplayUser>(Object.entries(guests))

        const allGames = realm.objects<GameSchema>('Game')
        const allPoints = realm.objects<PointSchema>('Point')
        const allActions = realm.objects<ActionSchema>('Action')

        realm.write(() => {
            // update all records based on guests
            allGames.forEach(game => {
                const teamOnePlayers: InGameStatsUser[] = []
                for (const player of game.teamOnePlayers) {
                    const guest = guestMap.get(player._id)
                    if (guest) {
                        teamOnePlayers.push({ ...player, ...guest })
                    } else {
                        teamOnePlayers.push(player)
                    }
                }
                game.teamOnePlayers = teamOnePlayers
            })

            allPoints.forEach(point => {
                const allPlayers = []
                const activePlayers = []
                for (const player of point.teamOnePlayers) {
                    const guest = guestMap.get(player._id)
                    if (guest) {
                        allPlayers.push(guest)
                    } else {
                        allPlayers.push(player)
                    }
                }

                for (const player of point.teamOneActivePlayers) {
                    const guest = guestMap.get(player._id)
                    if (guest) {
                        activePlayers.push(guest)
                    } else {
                        activePlayers.push(player)
                    }
                }

                point.teamOnePlayers = allPlayers
                point.teamOneActivePlayers = activePlayers
            })

            allActions.forEach(action => {
                const playerOneGuest = guestMap.get(action.playerOne?._id ?? '')
                if (playerOneGuest) {
                    action.playerOne = playerOneGuest
                }

                const playerTwoGuest = guestMap.get(action.playerTwo?._id ?? '')
                if (playerTwoGuest) {
                    action.playerTwo = playerTwoGuest
                }
            })
        })
    }

    const updateTeam = async (teamId: string) => {
        const response = await withToken(getManagedTeam, teamId)
        const { team } = response.data

        realm.write(() => {
            realm.create('Team', team, UpdateMode.Modified)
        })
    }

    return useMutation<void, ApiError, string>(async (gameId: string) => {
        const game = realm.objectForPrimaryKey<GameSchema>('Game', gameId)
        if (!game) return

        const fullGame = buildFullGame(game)
        const response = await withToken(pushOfflineGame, fullGame)

        const points = realm
            .objects<PointSchema>('Point')
            .filtered('gameId == $0', game._id)
        const actions = realm.objects<ActionSchema>('Action').filtered(
            'pointId IN $0',
            points.map(p => p._id),
        )

        await updateTeam(fullGame.teamOne._id)

        realm.write(() => {
            realm.delete(game)
            realm.delete(points)
            realm.delete(actions)
        })

        const { guests } = response.data
        replaceGuestsInLocalRecords(guests)
    })
}
