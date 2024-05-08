import { ClientPoint } from './point'
import { Tournament } from './tournament'
import { DisplayTeam, GuestTeam } from './team'
import { DisplayUser, InGameStatsUser } from './user'

export enum GameStatus {
    GUEST = 'guest',
    DEFINED = 'defined',
    ACTIVE = 'active',
    COMPLETE = 'complete',
}

export interface CreateGame {
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
}

export interface Game {
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
    totalViews: number
    teamOneStatus: GameStatus
    teamTwoStatus: GameStatus
}

export interface CreateFullGame extends CreateGame {
    teamOneScore: number
    teamTwoScore: number
    teamOnePlayers: DisplayUser[]
    points: ClientPoint[]
}
export interface SearchParams {
    q?: string
    live?: boolean
    after?: Date
    before?: Date
}

export interface UpdateGame {
    teamTwo?: DisplayTeam
    teamTwoDefined?: boolean
    scoreLimit?: number
    halfScore?: number
    startTime?: Date
    softcapMins?: number
    hardcapMins?: number
    playersPerPoint?: number
    timeoutPerHalf?: number
    floaterTimeout?: boolean
    tournament?: Tournament
}

export type LocalGame = Game & { offline: boolean }
export type PointStats = { _id: string; pointStats: InGameStatsUser[] }
