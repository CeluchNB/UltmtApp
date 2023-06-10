import { DisplayTeam } from './team'
import { DisplayUser } from './user'
export interface DisplayStat {
    name: string
    value: number
    points: number
}

export interface PlayerStats {
    goals: number
    assists: number
    blocks: number
    throwaways: number
    drops: number
    stalls: number
    touches: number
    catches: number
    completedPasses: number
    droppedPasses: number
    callahans: number
    pointsPlayed: number
    pulls: number
    wins: number
    losses: number
}

export interface CalculatedPlayerStats {
    plusMinus: number
    catchingPercentage: number
    throwingPercentage: number
    ppGoals: number
    ppAssists: number
    ppThrowaways: number
    ppDrops: number
    ppBlocks: number
    winPercentage: number
}

export interface AllPlayerStats extends PlayerStats, CalculatedPlayerStats {}

export interface TeamData {
    wins: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    holds: number
    breaks: number
    turnoverFreeHolds: number
    offensePoints: number
    defensePoints: number
    turnovers: number
    turnoversForced: number
}

export interface IdentifiedTeamStats extends TeamData {
    _id?: string
}

export interface TeamStats extends TeamData, DisplayTeam {
    players: string[]
    games: string[]
    winPercentage: number
    offensiveConversion: number
    defensiveConversion: number
}

export interface IdentifiedPlayerStats extends DisplayUser, AllPlayerStats {
    games: string[]
    teams: string[]
}

interface IdentifiedPlayerStatsSubset extends AllPlayerStats {
    _id: string
}

interface PointStats {
    _id: string
    players: IdentifiedPlayerStatsSubset[]
    teamOne: IdentifiedTeamStats
    teamTwo: IdentifiedTeamStats
}

export interface Leader {
    player?: DisplayUser
    total: number
}

export interface GameData {
    goalsLeader: Leader
    assistsLeader: Leader
    blocksLeader: Leader
    turnoversLeader: Leader
    plusMinusLeader: Leader
    pointsPlayedLeader: Leader
}

export interface GameStats extends GameData {
    _id: string
    startTime: string
    teamOneId: string
    teamTwoId?: string
    winningTeam?: 'one' | 'two'
    points: PointStats[]
}

export type FilteredGamePlayer = AllPlayerStats & DisplayUser
export interface FilteredGameStats extends GameData {
    _id: string
    startTime: string
    teamOneId: string
    teamTwoId?: string
    winningTeam?: 'one' | 'two'
    players: FilteredGamePlayer[]
}
export interface FilteredTeamStats extends GameData, TeamData {
    players: FilteredGamePlayer[]
    games: string[]
    winPercentage: number
    offensiveConversion: number
    defensiveConversion: number
}
