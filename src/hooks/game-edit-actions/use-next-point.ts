import { ApiError } from '../../types/services'
import { InGameStatsUser } from '../../types/user'
import { LiveGameContext } from '../../context/live-game-context'
import { PointStatus } from '../../types/point'
import { TeamNumber } from '../../types/team'
import { UpdateMode } from 'realm'
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
            return point?.teamOnePlayers ?? []
        } else {
            return point?.teamTwoPlayers ?? []
        }
    }, [point, team])

    const updatePlayerStats = (stats: InGameStatsUser[]) => {
        if (!game) return

        const players =
            team === 'one' ? game.teamOnePlayers : game.teamTwoPlayers
        const newPlayers = addInGameStatsPlayers(players, stats)

        for (let i = 0; i < players.length; i++) {
            const newPlayer = newPlayers.find(p => p._id === players[i]._id)
            if (!newPlayer) continue

            players[i] = newPlayer
        }
    }

    const createOfflinePointSchema = (pullingTeam: TeamNumber): PointSchema => {
        if (!game || !point)
            throw new ApiError('Must have game and point to finish the point')

        let teamOneScore = 0
        let teamTwoScore = 0
        if (pullingTeam === 'one') {
            teamOneScore += 1
        } else {
            teamTwoScore += 1
        }

        const schema = PointSchema.createOfflinePoint({
            pointNumber: point.pointNumber + 1,
            teamOneScore: point.teamOneScore + teamOneScore,
            teamTwoScore: point.teamTwoScore + teamTwoScore,
            pullingTeam:
                pullingTeam === 'one'
                    ? Object.assign({}, game.teamOne)
                    : Object.assign({}, game.teamTwo),
            receivingTeam:
                pullingTeam === 'one'
                    ? Object.assign({}, game.teamTwo)
                    : Object.assign({}, game.teamOne),
            gameId: game._id,
        })

        return schema
    }

    const offlineNextPoint = async (pullingTeam: TeamNumber) => {
        if (!game || !point) return

        const stats = generatePlayerStatsForPoint(
            allPointPlayers,
            actions.filter(action => action.teamNumber === team),
        )

        const newPointSchema = createOfflinePointSchema(pullingTeam)

        realm.write(() => {
            point.teamOneStatus = PointStatus.COMPLETE
            point.scoringTeam =
                pullingTeam === 'one'
                    ? Object.assign({}, game.teamOne)
                    : Object.assign({}, game.teamTwo)
            point.teamOneScore = newPointSchema.teamOneScore
            point.teamTwoScore = newPointSchema.teamTwoScore

            realm.create('Point', newPointSchema, UpdateMode.Modified)

            game.teamOneScore = newPointSchema.teamOneScore
            game.teamTwoScore = newPointSchema.teamTwoScore

            updatePlayerStats(stats)
            game.statsPoints.push({ _id: point._id, pointStats: stats })
        })
        setCurrentPointNumber(point.pointNumber + 1)
    }

    const onlineNextPoint = async (
        pullingTeam: TeamNumber,
        emitNextPoint: () => void,
    ) => {
        if (!point || !game) return

        const response = await withGameToken(
            nextPoint,
            pullingTeam,
            point.pointNumber,
        )
        const { point: pointResponse } = response.data
        emitNextPoint()

        const stats = generatePlayerStatsForPoint(
            allPointPlayers,
            actions.filter(action => action.teamNumber === team),
        )

        const schema = new PointSchema(pointResponse)
        realm.write(() => {
            realm.delete(actions)
            realm.create('Point', schema, UpdateMode.Modified)

            game.teamOneScore = schema.teamOneScore
            game.teamTwoScore = schema.teamTwoScore

            updatePlayerStats(stats)
            game.statsPoints.push({ _id: point._id, pointStats: stats })
            realm.delete(point)
        })
        setCurrentPointNumber(pointResponse.pointNumber)
    }

    return useMutation<
        undefined,
        ApiError,
        { pullingTeam: TeamNumber; emitNextPoint: () => void }
    >(async ({ pullingTeam, emitNextPoint }) => {
        if (!point || !game) return

        if (game.offline) {
            await offlineNextPoint(pullingTeam)
        } else {
            await onlineNextPoint(pullingTeam, emitNextPoint)
        }
    })
}
