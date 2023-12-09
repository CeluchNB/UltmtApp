import * as Constants from '../../utils/constants'
import { Game } from '../../types/game'
import Point from '../../types/point'
import { PointSchema } from '../../models'
import { Realm } from '@realm/react'
import { getRealm } from '../../models/realm'
import { throwLocalError } from '../../utils/service-utils'

const parsePoint = (schema: PointSchema): Point => {
    return JSON.parse(
        JSON.stringify({
            _id: schema._id,
            pointNumber: schema.pointNumber,
            teamOnePlayers: schema.teamOnePlayers,
            teamTwoPlayers: schema.teamTwoPlayers,
            teamOneActivePlayers: schema.teamOneActivePlayers,
            teamTwoActivePlayers: schema.teamTwoActivePlayers,
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
    game: Game,
): Promise<string> => {
    const realm = await getRealm()

    let pointId = new Realm.BSON.ObjectID().toHexString()
    const point: Point = {
        _id: pointId,
        pointNumber,
        teamOnePlayers: [],
        teamTwoPlayers: [],
        teamOneActivePlayers: [],
        teamTwoActivePlayers: [],
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

    realm.write(() => {
        realm.create('Point', point, Realm.UpdateMode.All)
    })
}

export const getPointById = async (pointId: string): Promise<Point> => {
    const realm = await getRealm()
    const point = await realm.objectForPrimaryKey<PointSchema>('Point', pointId)
    if (!point) {
        return throwLocalError(Constants.GET_POINT_ERROR)
    }
    const result = parsePoint(point)
    return result
}

export const getPointByPointNumber = async (
    pointNumber: number,
    gamePoints: string[],
): Promise<Point | undefined> => {
    const realm = await getRealm()
    const gameString = gamePoints.map(id => {
        return `"${id}"`
    })

    const points = await realm
        .objects<PointSchema>('Point')
        .filtered(`pointNumber == ${pointNumber} && _id IN { ${gameString} }`)

    if (points.length === 0 || points.length > 1) {
        return throwLocalError(Constants.GET_POINT_ERROR)
    }

    return parsePoint(points[0])
}

export const getActivePointByGame = async (
    game: Game,
): Promise<Point | undefined> => {
    const realm = await getRealm()

    const gameString = game.points.map(id => {
        return `"${id}"`
    })

    const points = await realm
        .objects<PointSchema>('Point')
        .filtered(`teamOneActive == $0 && _id IN { $1 }`, true, gameString)

    if (points.length === 0 || points.length > 1) {
        return undefined
    }

    return parsePoint(points[0])
}

export const deletePoint = async (pointId: string) => {
    const realm = await getRealm()
    const point = await realm.objectForPrimaryKey('Point', pointId)

    realm.write(() => {
        realm.delete(point)
    })
}
