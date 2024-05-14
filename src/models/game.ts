import { DisplayUser } from '../types/user'
import { Realm } from '@realm/react'
import { Tournament } from '../types/tournament'
import { CreateGame, Game, GameStatus, PointStats } from '../types/game'
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
            teamOnePlayers: 'DisplayUser[]',
            teamTwoPlayers: 'DisplayUser[]',
            resolveCode: 'string',
            statsPoints: 'PointStats[]',
            offline: 'bool',
            teamOneStatus: 'string',
            teamTwoStatus: 'string',
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
    teamOnePlayers: DisplayUser[]
    teamTwoPlayers: DisplayUser[]
    resolveCode: string
    statsPoints: PointStats[]
    offline: boolean
    teamOneStatus: GameStatus
    teamTwoStatus: GameStatus

    constructor(
        game: Game,
        offline: boolean = false,
        statsPoints: PointStats[] = [],
    ) {
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
        this.teamOnePlayers = game.teamOnePlayers
        this.teamTwoPlayers = game.teamTwoPlayers
        this.resolveCode = game.resolveCode || ''
        this.statsPoints = statsPoints
        this.offline = offline
        this.teamOneStatus = game.teamOneStatus
        this.teamTwoStatus = game.teamTwoStatus
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
            statsPoints: [],
            offline: true,
        }
    }
}
export const PointStatsSchema: Realm.ObjectSchema = {
    name: 'PointStats',
    embedded: true,
    properties: {
        _id: 'string',
        pointStats: 'PlayerPointStats[]',
    },
}

export const PlayerPointStatsSchema: Realm.ObjectSchema = {
    name: 'PlayerPointStats',
    embedded: true,
    properties: {
        _id: 'string',
        firstName: 'string',
        lastName: 'string',
        username: 'string?',
        pointsPlayed: 'int',
        goals: 'int',
        assists: 'int',
        turnovers: 'int',
        blocks: 'int',
    },
}
