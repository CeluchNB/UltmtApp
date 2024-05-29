import { ApiError } from '../../types/services'
import { BSON } from 'realm'
import { InGameStatsUser } from '../../types/user'
import { LiveGameContext } from '../../context/live-game-context'
import { backPoint } from '../../services/network/point'
import { subtractInGameStatsPlayers } from '../../utils/in-game-stats'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { withGameToken } from '../../services/data/game'
import { ActionSchema, PointSchema } from '../../models'
import { useQuery, useRealm } from './../../context/realm'

export const useBackPoint = (currentPointId: string) => {
    const realm = useRealm()
    const actions = useQuery<ActionSchema>(
        {
            type: 'Action',
            query: collection => {
                return collection.filtered('pointId == $0', currentPointId)
            },
        },
        [currentPointId],
    )
    const { game, point, team, setCurrentPointNumber } =
        useContext(LiveGameContext)

    const updatePlayerStats = (stats: InGameStatsUser[]) => {
        const players =
            team === 'one' ? game.teamOnePlayers : game.teamTwoPlayers
        const newPlayers = subtractInGameStatsPlayers(players, stats)

        for (let i = 0; i < players.length; i++) {
            // TODO: GAME-REFACTOR use map instead of find?
            const newPlayer = newPlayers.find(p => p._id === players[i]._id)
            if (!newPlayer) continue

            players[i] = newPlayer
        }
    }

    return useMutation<undefined, ApiError>({
        mutationFn: async () => {
            const response = await withGameToken(backPoint, point?.pointNumber)

            const { point: pointResponse, actions: actionsResponse } =
                response.data

            const schema = new PointSchema(pointResponse)
            realm.write(() => {
                realm.delete(actions)
                realm.create('Point', schema)

                for (const action of actionsResponse) {
                    const actionSchema = new ActionSchema(
                        { ...action, teamNumber: team },
                        action.pointId,
                        new BSON.ObjectId(action._id),
                    )
                    realm.create('Action', actionSchema)
                }

                game.teamOneScore = schema.teamOneScore
                game.teamTwoScore = schema.teamTwoScore

                // TODO: GAME-REFACTOR use _id rather than index
                updatePlayerStats(
                    game.statsPoints[game.statsPoints.length - 1].pointStats,
                )
                realm.delete(game.statsPoints[game.statsPoints.length - 1])
                realm.delete(point)
            })
            setCurrentPointNumber(pointResponse.pointNumber)
        },
    })
}
