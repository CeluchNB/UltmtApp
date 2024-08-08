import { BSON } from 'realm'
import { DisplayUser } from '../types/user'
import { GuestTeam } from '../types/team'
import { Realm } from '@realm/react'
import Point, { PointStatus } from '../types/point'

export class PointSchema {
    static schema: Realm.ObjectSchema = {
        name: 'Point',
        primaryKey: '_id',
        properties: {
            _id: 'string',
            pointNumber: 'int',
            teamOnePlayers: 'DisplayUser[]',
            teamTwoPlayers: 'DisplayUser[]',
            teamOneActivePlayers: 'DisplayUser[]',
            teamTwoActivePlayers: 'DisplayUser[]',
            teamOneScore: 'int',
            teamTwoScore: 'int',
            pullingTeam: 'GuestTeam',
            receivingTeam: 'GuestTeam',
            scoringTeam: 'GuestTeam',
            teamOneActions: 'string[]',
            teamTwoActions: 'string[]',
            gameId: 'string',
            teamOneStatus: 'string',
            teamTwoStatus: 'string',
        },
    }

    _id: string
    pointNumber: number
    teamOnePlayers: DisplayUser[]
    teamTwoPlayers: DisplayUser[]
    teamOneActivePlayers: DisplayUser[]
    teamTwoActivePlayers: DisplayUser[]
    teamOneScore: number
    teamTwoScore: number
    pullingTeam: GuestTeam
    receivingTeam: GuestTeam
    scoringTeam?: GuestTeam
    teamOneActions: string[]
    teamTwoActions: string[]
    gameId: string
    teamOneStatus: string
    teamTwoStatus: string

    constructor(point: Point) {
        this._id = point._id
        this.pointNumber = point.pointNumber
        this.teamOnePlayers = point.teamOnePlayers
        this.teamTwoPlayers = point.teamTwoPlayers
        this.teamOneActivePlayers = point.teamOneActivePlayers
        this.teamTwoActivePlayers = point.teamTwoActivePlayers
        this.teamOneScore = point.teamOneScore
        this.teamTwoScore = point.teamTwoScore
        this.pullingTeam = point.pullingTeam
        this.receivingTeam = point.receivingTeam
        this.scoringTeam = point.scoringTeam
        this.teamOneActions = point.teamOneActions
        this.teamTwoActions = point.teamTwoActions
        this.gameId = point.gameId
        this.teamOneStatus = point.teamOneStatus
        this.teamTwoStatus = point.teamTwoStatus
    }

    static createOfflinePoint(data: {
        pointNumber: number
        teamOneScore: number
        teamTwoScore: number
        pullingTeam: GuestTeam
        receivingTeam: GuestTeam
        gameId: string
    }): PointSchema {
        return {
            _id: new BSON.ObjectId().toHexString(),
            pointNumber: data.pointNumber,
            teamOnePlayers: [],
            teamTwoPlayers: [],
            teamOneActivePlayers: [],
            teamTwoActivePlayers: [],
            teamOneScore: data.teamOneScore,
            teamTwoScore: data.teamTwoScore,
            pullingTeam: data.pullingTeam,
            receivingTeam: data.receivingTeam,
            scoringTeam: undefined,
            teamOneActions: [],
            teamTwoActions: [],
            gameId: data.gameId,
            teamOneStatus: PointStatus.ACTIVE,
            teamTwoStatus: PointStatus.FUTURE,
        }
    }
}
