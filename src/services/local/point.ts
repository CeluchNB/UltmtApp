import * as Constants from '../../utils/constants'
import Point from '../../types/point'
import { Realm } from '@realm/react'
import { getLocalGameId } from './game'
import { getRealm } from '../../models/realm'
import { throwApiError } from '../../utils/service-utils'
import { GameSchema, PointSchema } from '../../models'

const parsePoint = (schema: PointSchema): Point => {
    return JSON.parse(
        JSON.stringify({
            _id: schema._id,
            pointNumber: schema.pointNumber,
            teamOnePlayers: schema.teamOnePlayers,
            teamTwoPlayers: schema.teamTwoPlayers,
            teamOneScore: schema.teamTwoScore,
            teamTwoScore: schema.teamTwoScore,
            pullingTeam: schema.pullingTeam,
            receivingTeam: schema.receivingTeam,
            scoringTeam: schema.scoringTeam,
            teamOneActive: schema.teamOneActive,
            teamTwoActive: schema.teamTwoActive,
            teamOneActions: schema.teamOneActions,
            teamTwoActions: schema.teamTwoActions,
        }),
    )
}

export const savePoint = async (point: Point) => {
    const realm = await getRealm()
    const gameId = await getLocalGameId()
    const game = await realm.objectForPrimaryKey<GameSchema>('Game', gameId)

    if (!game) {
        return throwApiError({}, Constants.GET_GAME_ERROR)
    }

    realm.write(() => {
        const rPoint = realm.create('Point', point, Realm.UpdateMode.Modified)
        game.points = [...new Set([...game.points, rPoint._id])]
    })
}

export const getPointById = async (pointId: string): Promise<Point> => {
    const realm = await getRealm()
    const point = await realm.objectForPrimaryKey<PointSchema>('Point', pointId)
    if (!point) {
        return throwApiError({}, Constants.GET_POINT_ERROR)
    }
    return parsePoint(point)
}
