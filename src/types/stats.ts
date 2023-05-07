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

export interface IdentifiedPlayerStats extends DisplayUser, AllPlayerStats {
    games: string[]
    teams: string[]
}
