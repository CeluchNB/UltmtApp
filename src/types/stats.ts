import { DisplayUser } from './user'
export interface DisplayStat {
    name: string
    value: number
    points: number
}

export interface PlayerStats extends DisplayUser {
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
    plusMinus: number
    catchingPercentage: number
    throwingPercentage: number
    ppGoals: number
    ppAssists: number
    ppThrowaways: number
    ppDrops: number
    ppBlocks: number
    winPercentage: number
    games: string[]
    teams: string[]
}
