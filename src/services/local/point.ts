import * as Constants from '../../utils/constants'
import Point from '../../types/point'
import { Realm } from '@realm/react'
import { getRealm } from '../../models/realm'
import { throwApiError } from '../../utils/service-utils'
import { GameSchema, PointSchema } from '../../models'
import { activeGameId, getGameById } from './game'

const parsePoint = (schema: PointSchema): Point => {
    return JSON.parse(
        JSON.stringify({
            _id: schema._id,
            pointNumber: schema.pointNumber,
            teamOnePlayers: schema.teamOnePlayers,
            teamTwoPlayers: schema.teamTwoPlayers,
            teamOneScore: schema.teamOneScore,
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

export const createOfflinePoint = async (
    pulling: boolean,
    pointNumber: number,
    gameId: string,
): Promise<string> => {
    const realm = await getRealm()

    const game = await getGameById(gameId)
    let pointId = new Realm.BSON.ObjectID().toHexString()
    const point: Point = {
        _id: pointId,
        pointNumber,
        teamOnePlayers: [],
        teamTwoPlayers: [],
        teamOneScore: game.teamOneScore,
        teamTwoScore: game.teamTwoScore,
        teamOneActions: [],
        teamTwoActions: [],
        teamOneActive: true,
        teamTwoActive: false,
        pullingTeam: pulling ? game.teamOne : game.teamTwo,
        receivingTeam: pulling ? game.teamTwo : game.teamOne,
    }

    realm.write(() => {
        realm.create<PointSchema>('Point', point)
    })

    return pointId
}

export const savePoint = async (point: Point) => {
    const realm = await getRealm()
    const gameId = await activeGameId()
    const game = await realm.objectForPrimaryKey<GameSchema>('Game', gameId)

    if (!game) {
        return throwApiError({}, Constants.GET_GAME_ERROR)
    }

    realm.write(() => {
        const rPoint = realm.create('Point', point, Realm.UpdateMode.Modified)
        game.points = [...new Set([...game.points, rPoint._id])]
        game.teamOneScore = rPoint.teamOneScore
        game.teamTwoScore = rPoint.teamTwoScore
    })
}

export const getPointById = async (pointId: string): Promise<Point> => {
    const realm = await getRealm()
    const point = await realm.objectForPrimaryKey<PointSchema>('Point', pointId)
    if (!point) {
        return throwApiError({}, Constants.GET_POINT_ERROR)
    }
    const result = parsePoint(point)
    return result
}
