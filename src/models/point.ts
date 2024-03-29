import { DisplayUser } from '../types/user'
import { GuestTeam } from '../types/team'
import Point from '../types/point'
import { Realm } from '@realm/react'

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
            teamOneActive: 'bool',
            teamTwoActive: 'bool',
            teamOneActions: 'string[]',
            teamTwoActions: 'string[]',
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
    teamOneActive: boolean
    teamTwoActive: boolean
    teamOneActions: string[]
    teamTwoActions: string[]

    constructor(point: Point) {
        this._id = point._id
        this.pointNumber = point.pointNumber
        this.teamOnePlayers = point.teamOnePlayers
        this.teamTwoPlayers = point.teamTwoPlayers
        this.teamOneActivePlayers = point.teamOneActivePlayers
        this.teamTwoActivePlayers = point.teamTwoActivePlayers
        this.teamOneScore = point.teamTwoScore
        this.teamTwoScore = point.teamTwoScore
        this.pullingTeam = point.pullingTeam
        this.receivingTeam = point.receivingTeam
        this.scoringTeam = point.scoringTeam
        this.teamOneActive = point.teamOneActive
        this.teamTwoActive = point.teamTwoActive
        this.teamOneActions = point.teamOneActions
        this.teamTwoActions = point.teamTwoActions
    }
}
