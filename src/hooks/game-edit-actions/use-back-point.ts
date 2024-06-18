import { ActionType } from '../../types/action'
import { ApiError } from '../../types/services'
import { BSON } from 'realm'
import { InGameStatsUser } from '../../types/user'
import { LiveGameContext } from '../../context/live-game-context'
import { PointStatus } from '../../types/point'
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
    const lastPointQuery = useQuery<PointSchema>(
        {
            type: 'Point',
            query: collection => {
                return collection.filtered(
                    'pointNumber == $0 AND gameId = $1',
                    (point?.pointNumber ?? 0) - 1,
                    game?._id,
                )
            },
        },
        [point],
    )
    const lastPointActions = useQuery<ActionSchema>(
        {
            type: 'Action',
            query: collection => {
                return collection
                    .filtered(
                        'pointId == $0',
                        lastPointQuery.length > 0 ? lastPointQuery[0]._id : '',
                    )
                    .sorted('actionNumber', true)
            },
        },
        [lastPointQuery],
    )

    const updatePlayerStats = (stats?: InGameStatsUser[]) => {
        if (!stats) return

        const players =
            (team === 'one' ? game?.teamOnePlayers : game?.teamTwoPlayers) ?? []
        const newPlayers = subtractInGameStatsPlayers(players, stats)

        for (let i = 0; i < players.length; i++) {
            const newPlayer = newPlayers.get(players[i]._id)
            if (!newPlayer) continue

            players[i] = newPlayer
        }
    }

    const offlineBackPoint = () => {
        if (!game || !point) return

        const pointNumber = point.pointNumber

        const lastPoint =
            lastPointQuery.length > 0 ? lastPointQuery[0] : undefined

        const lastAction =
            lastPointActions.length > 0
                ? lastPointActions[0].actionType
                : ActionType.TEAM_ONE_SCORE

        let teamOneScoreUpdate = 0
        let teamTwoScoreUpdate = 0
        if (lastAction === ActionType.TEAM_ONE_SCORE) {
            teamOneScoreUpdate = 1
        } else {
            teamTwoScoreUpdate = 1
        }

        realm.write(() => {
            if (lastPoint) {
                lastPoint.teamOneStatus = PointStatus.ACTIVE

                lastPoint.teamOneScore -= teamOneScoreUpdate
                lastPoint.teamTwoScore -= teamTwoScoreUpdate

                game.teamOneScore = lastPoint.teamOneScore
                game.teamTwoScore = lastPoint.teamTwoScore

                updatePlayerStats(
                    game.statsPoints.find(stats => stats._id === lastPoint._id)
                        ?.pointStats,
                )
                realm.delete(
                    game.statsPoints.find(stats => stats._id === lastPoint._id),
                )
            }

            realm.delete(actions)
            realm.delete(point)
        })
        setCurrentPointNumber(pointNumber - 1)
    }

    const onlineBackPoint = async () => {
        if (!point || !game) return

        const response = await withGameToken(backPoint, point.pointNumber)

        const { point: pointResponse, actions: actionsResponse } = response.data

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

            updatePlayerStats(
                game.statsPoints.find(stats => stats._id === pointResponse._id)
                    ?.pointStats,
            )
            realm.delete(
                game.statsPoints.find(stats => stats._id === pointResponse._id),
            )
            realm.delete(point)
        })
        setCurrentPointNumber(pointResponse.pointNumber)
    }

    return useMutation<undefined, ApiError>({
        mutationFn: async () => {
            if (game?.offline) {
                offlineBackPoint()
            } else {
                onlineBackPoint()
            }
        },
    })
}
