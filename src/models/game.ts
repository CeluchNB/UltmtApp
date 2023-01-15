import { DisplayUser } from '../types/user'
import { Game } from '../types/game'
import { Realm } from '@realm/react'
import { Tournament } from '../types/tournament'
import { DisplayTeam, GuestTeam } from '../types/team'

export class GameSchema {
    static schema: Realm.ObjectSchema = {
        name: 'Game',
        primaryKey: '_id',
        properties: {
            _id: 'string',
            creator: 'DisplayUser',
            teamOne: 'DisplayTeam',
            teamTwo: 'GuestTeam',
            teamTwoDefined: 'bool',
            scoreLimit: 'int',
            halfScore: 'int',
            startTime: 'date',
            softcapMins: 'int',
            hardcapMins: 'int',
            playersPerPoint: 'int',
            timeoutPerHalf: 'int',
            floaterTimeout: 'bool',
            tournament: 'Tournament?',
            teamOneScore: 'int',
            teamTwoScore: 'int',
            teamOneActive: 'bool',
            teamTwoActive: 'bool',
            teamOnePlayers: 'DisplayUser[]',
            teamTwoPlayers: 'DisplayUser[]',
            resolveCode: 'string',
            points: 'string[]',
            offline: 'bool',
        },
    }

    _id: string
    creator: DisplayUser
    teamOne: DisplayTeam
    teamTwo: GuestTeam
    teamTwoDefined: boolean
    scoreLimit: number
    halfScore: number
    startTime: Date
    softcapMins: number
    hardcapMins: number
    playersPerPoint: number
    timeoutPerHalf: number
    floaterTimeout: boolean
    tournament?: Tournament
    teamOneScore: number
    teamTwoScore: number
    teamOneActive: boolean
    teamTwoActive: boolean
    teamOnePlayers: DisplayUser[]
    teamTwoPlayers: DisplayUser[]
    resolveCode: string
    points: string[]
    offline: boolean

    constructor(game: Game, offline: boolean = false) {
        this._id = game._id
        this.creator = game.creator
        this.teamOne = game.teamOne
        this.teamTwo = game.teamTwo
        this.teamTwoDefined = game.teamTwoDefined
        this.scoreLimit = game.scoreLimit
        this.halfScore = game.halfScore
        this.startTime = game.startTime
        this.softcapMins = game.softcapMins
        this.hardcapMins = game.hardcapMins
        this.playersPerPoint = game.playersPerPoint
        this.timeoutPerHalf = game.timeoutPerHalf
        this.floaterTimeout = game.floaterTimeout
        this.tournament = game.tournament
        this.teamOneScore = game.teamOneScore
        this.teamTwoScore = game.teamTwoScore
        this.teamOneActive = game.teamOneActive
        this.teamTwoActive = game.teamTwoActive
        this.teamOnePlayers = game.teamOnePlayers
        this.teamTwoPlayers = game.teamTwoPlayers
        this.resolveCode = game.resolveCode
        this.points = game.points
        this.offline = offline
    }
}
