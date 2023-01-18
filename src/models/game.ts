import { DisplayUser } from '../types/user'
import { Realm } from '@realm/react'
import { Tournament } from '../types/tournament'
import { CreateGame, Game } from '../types/game'
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

    static createOfflineGame(game: CreateGame, teamOnePlayers: DisplayUser[]) {
        return {
            _id: new Realm.BSON.ObjectID().toHexString(),
            creator: game.creator,
            teamOne: game.teamOne,
            teamTwo: game.teamTwo,
            teamTwoDefined: game.teamTwoDefined,
            scoreLimit: game.scoreLimit,
            halfScore: game.halfScore,
            startTime: new Date(game.startTime),
            softcapMins: game.softcapMins,
            hardcapMins: game.hardcapMins,
            playersPerPoint: game.playersPerPoint,
            timeoutPerHalf: game.timeoutPerHalf,
            floaterTimeout: game.floaterTimeout,
            tournament: game.tournament,
            teamOneScore: 0,
            teamTwoScore: 0,
            teamOneActive: true,
            teamTwoActive: false,
            teamOnePlayers: teamOnePlayers,
            teamTwoPlayers: [],
            resolveCode: '',
            points: [],
            offline: true,
        }
    }
}
