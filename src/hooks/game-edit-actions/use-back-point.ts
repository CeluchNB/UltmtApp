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

    const { mutateAsync, isLoading, error } = useMutation(
        async () => {
            // TODO: GAME-REFACTOR ensure network error correctly passed to error prop
            const response = await withGameToken(backPoint, point?.pointNumber)

            const { point: pointResponse, actions: actionsResponse } =
                response.data

            realm.write(() => {
                realm.delete(actions)
                const schema = new PointSchema(pointResponse)
                realm.create('Point', schema)

                // TODO: GAME-REFACTOR START HERE - UNDO DOES NOT WORK AFTER GOING BACK A POINT? Seems to work now
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
            })
            setCurrentPointNumber(pointResponse.pointNumber)

            return { pointResponse, actionsResponse }
        },
        {
            onSuccess: () => {
                realm.write(() => {
                    realm.delete(point)
                })
            },
        },
    )

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

    return {
        backPoint: mutateAsync,
        isLoading,
        error,
    }
}
