import { ApiError } from '../../types/services'
import { InGameStatsUser } from '../../types/user'
import { LiveGameContext } from '../../context/live-game-context'
import { TeamNumber } from '../../types/team'
import { nextPoint } from '../../services/network/point'
import { useMutation } from 'react-query'
import { withGameToken } from '../../services/data/game'
import { ActionSchema, PointSchema } from '../../models'
import {
    addInGameStatsPlayers,
    generatePlayerStatsForPoint,
} from '../../utils/in-game-stats'
import { useContext, useMemo } from 'react'
import { useQuery, useRealm } from '../../context/realm'

export const useNextPoint = (currentPointId: string) => {
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

    const allPointPlayers = useMemo(() => {
        if (team === 'one') {
            return point.teamOnePlayers ?? []
        } else {
            return point.teamTwoPlayers ?? []
        }
    }, [point, team])

    const updatePlayerStats = (stats: InGameStatsUser[]) => {
        const players =
            team === 'one' ? game.teamOnePlayers : game.teamTwoPlayers
        const newPlayers = addInGameStatsPlayers(players, stats)

        for (let i = 0; i < players.length; i++) {
            // TODO: GAME-REFACTOR use map instead of find?
            const newPlayer = newPlayers.find(p => p._id === players[i]._id)
            if (!newPlayer) continue

            players[i] = newPlayer
        }
    }

    return useMutation<undefined, ApiError, TeamNumber>(async pullingTeam => {
        if (!point) return

        const response = await withGameToken(
            nextPoint,
            pullingTeam,
            point.pointNumber,
        )
        const { point: pointResponse } = response.data

        const stats = generatePlayerStatsForPoint(
            allPointPlayers,
            actions.filter(action => action.teamNumber === team),
        )

        const schema = new PointSchema(pointResponse)
        realm.write(() => {
            realm.delete(actions)
            realm.create('Point', schema)

            game.teamOneScore = schema.teamOneScore
            game.teamTwoScore = schema.teamTwoScore

            updatePlayerStats(stats)
            game.statsPoints.push({ _id: point._id, pointStats: stats })
            realm.delete(point)
        })
        setCurrentPointNumber(pointResponse.pointNumber)
    })
}
