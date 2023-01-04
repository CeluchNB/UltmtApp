import { Tournament } from './tournament'
import { DisplayTeam, GuestTeam } from './team'
import { DisplayUser, GuestUser } from './user'
export interface DisplayGame {
    opponent: DisplayTeam
    teamScore: number
    opponentScore: number
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
    teamOneActive: boolean
    teamTwoActive: boolean
    teamOnePlayers: DisplayUser[]
    teamTwoPlayers: DisplayUser[]
    resolveCode: string
    points: string[]
}

export interface SearchParams {
    q?: string
    live?: boolean
    after?: Date
    before?: Date
}
