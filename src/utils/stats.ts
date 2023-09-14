import { ActionType, ServerActionData } from '../types/action'
import {
    AllPlayerStats,
    CalculatedPlayerStats,
    DisplayStat,
    FilteredTeamStats,
    GameData,
    PlayerIdUser,
    PlayerStats,
    TeamData,
} from '../types/stats'

export const convertProfileScreenStatsToStatListItem = (
    stats?: AllPlayerStats,
): DisplayStat[] => {
    if (!stats) return []
    return [
        { name: 'Goals', value: stats.goals, points: stats.pointsPlayed },
        {
            name: 'Assists',
            value: stats.assists,
            points: stats.pointsPlayed,
        },
        { name: 'Blocks', value: stats.blocks, points: stats.pointsPlayed },
        {
            name: '+ / -',
            value: stats.plusMinus,
            points: stats.pointsPlayed,
        },
    ]
}

export const convertGameStatsToLeaderItems = (
    stats?: GameData,
): {
    title: string
    player?: PlayerIdUser
    total?: number
}[] => {
    if (!stats) return []

    return [
        {
            title: 'Goals',
            player: stats?.goalsLeader.player,
            total: stats?.goalsLeader.total,
        },
        {
            title: 'Assists',
            player: stats?.assistsLeader.player,
            total: stats?.assistsLeader.total,
        },
        {
            title: '+ / -',
            player: stats?.plusMinusLeader.player,
            total: stats?.plusMinusLeader.total,
        },
        {
            title: 'Blocks',
            player: stats?.blocksLeader.player,
            total: stats?.blocksLeader.total,
        },
        {
            title: 'Points Played',
            player: stats?.pointsPlayedLeader.player,
            total: stats?.pointsPlayedLeader.total,
        },
        {
            title: 'Turnovers',
            player: stats?.turnoversLeader.player,
            total: stats?.turnoversLeader.total,
        },
    ]
}

export const convertTeamStatsToGameOverviewItems = (
    stats?: TeamData,
): { title: string; total: number }[] => {
    if (!stats) return []

    return [
        {
            title: 'Offensive Points',
            total: stats.offensePoints,
        },
        {
            title: 'Holds',
            total: stats.holds,
        },
        {
            title: 'Turnover Free Holds',
            total: stats.turnoverFreeHolds,
        },
        {
            title: 'Turnovers',
            total: stats.turnovers,
        },
        {
            title: 'Defensive Points',
            total: stats.defensePoints,
        },
        {
            title: 'Breaks',
            total: stats.breaks,
        },
        {
            title: 'Turnovers Forced',
            total: stats.turnoversForced,
        },
    ]
}

export const convertTeamStatsToTeamOverviewItems = (
    stats?: FilteredTeamStats,
): { title: string; total: number | string }[] => {
    if (!stats) return []

    const items = [
        {
            title: 'Wins',
            total: stats.wins,
        },
        {
            title: 'Losses',
            total: stats.losses,
        },
        {
            title: 'Win Percentage',
            total: `${Number(stats.winPercentage * 100).toFixed(0)}%`,
        },
        {
            title: 'Offensive Conversion',
            total: `${Number(stats.offensiveConversion * 100).toFixed(0)}%`,
        },
        {
            title: 'Defensive Conversion',
            total: `${Number(stats.defensiveConversion * 100).toFixed(0)}%`,
        },
    ]
    return [...items, ...convertTeamStatsToGameOverviewItems(stats)]
}

export const formatNumber = (key: string, value: number | string): string => {
    if (statIsPercentage(key)) {
        return `${(Number(value) * 100).toFixed(0)}%`
    }
    if (Number(value) % 1 === 0) {
        return value.toString()
    }
    return Number(value).toFixed(2)
}

const statIsPercentage = (key: string): boolean => {
    return key.toLowerCase().includes('percentage')
}

export const mapStatDisplayName = (value: string): string => {
    switch (value) {
        case 'completedPasses':
            return 'Completed Passes'
        case 'droppedPasses':
            return 'Dropped Passes'
        case 'pointsPlayed':
            return 'Points Played'
        case 'plusMinus':
            return 'Plus / Minus'
        case 'catchingPercentage':
            return 'Catching Percentage'
        case 'throwingPercentage':
            return 'Throwing Percentage'
        case 'hockeyAssists':
            return 'Hockey Assists'
        case 'ppGoals':
            return 'Goals per point'
        case 'ppAssists':
            return 'Assists per point'
        case 'ppThrowaways':
            return 'Throwaways per point'
        case 'ppHockeyAssists':
            return 'Hockey Assists per point'
        case 'ppDrops':
            return 'Drops per point'
        case 'ppBlocks':
            return 'Blocks per point'
        case 'winPercentage':
            return 'Win Percentage'
        default:
            return value.charAt(0).toUpperCase() + value.slice(1)
    }
}

export const addPlayerStats = (
    data1: PlayerStats,
    data2: PlayerStats,
): PlayerStats => {
    return {
        goals: data1.goals + data2.goals,
        assists: data1.assists + data2.assists,
        hockeyAssists: data1.hockeyAssists + data2.hockeyAssists,
        touches: data1.touches + data2.touches,
        catches: data1.catches + data2.catches,
        callahans: data1.callahans + data2.callahans,
        throwaways: data1.throwaways + data2.throwaways,
        blocks: data1.blocks + data2.blocks,
        drops: data1.drops + data2.drops,
        stalls: data1.stalls + data2.stalls,
        completedPasses: data1.completedPasses + data2.completedPasses,
        droppedPasses: data1.droppedPasses + data2.droppedPasses,
        pointsPlayed: data1.pointsPlayed + data2.pointsPlayed,
        pulls: data1.pulls + data2.pulls,
        wins: data1.wins + data2.wins,
        losses: data1.losses + data2.losses,
    }
}

export const calculatePlayerStats = (stats: PlayerStats): AllPlayerStats => {
    const calcStats: CalculatedPlayerStats = {
        winPercentage: createSafeFraction(
            stats.wins,
            stats.wins + stats.losses,
        ),
        plusMinus:
            stats.goals +
            stats.assists +
            stats.blocks -
            stats.throwaways -
            stats.drops,
        catchingPercentage: createSafeFraction(
            stats.catches,
            stats.catches + stats.drops,
        ),
        throwingPercentage: createSafeFraction(
            stats.completedPasses,
            stats.completedPasses + stats.throwaways + stats.droppedPasses,
        ),
        ppGoals: createSafeFraction(stats.goals, stats.pointsPlayed),
        ppAssists: createSafeFraction(stats.assists, stats.pointsPlayed),
        ppThrowaways: createSafeFraction(stats.throwaways, stats.pointsPlayed),
        ppDrops: createSafeFraction(stats.drops, stats.pointsPlayed),
        ppBlocks: createSafeFraction(stats.blocks, stats.pointsPlayed),
    }

    return { ...stats, ...calcStats }
}

const createSafeFraction = (numerator: number, denominator: number): number => {
    if (denominator === 0) {
        return 0
    }
    return numerator / denominator
}

export const sortAlphabetically = (str1: string, str2: string): number => {
    if (str1 < str2) {
        return -1
    } else if (str2 < str1) {
        return 1
    }
    return 0
}

export const INVALID_COLUMNS = [
    'display',
    'firstName',
    'lastName',
    '_id',
    'username',
    'games',
    'teams',
    '__v',
    'id',
    'teamId',
    'gameId',
    'playerId',
    'wins',
    'losses',
]
export const OVERALL_COLUMNS = [
    'plusMinus',
    'pointsPlayed',
    'catchingPercentage',
    'throwingPercentage',
]
export const OFFENSE_COLUMNS = [
    'goals',
    'assists',
    'touches',
    'completions',
    'throwaways',
    'drops',
    'stalls',
    'catches',
    'completedPasses',
    'droppedPasses',
    'hockeyAssists',
]
export const DEFENSE_COLUMNS = ['blocks', 'pulls', 'callahans']
export const PER_POINT_COLUMNS = [
    'ppGoals',
    'ppAssists',
    'ppThrowaways',
    'ppDrops',
    'ppBlocks',
    'pointsPlayed',
]

// TODO: remove below if unused
export const calculateMomentumData = (
    teamOneActions: ServerActionData[],
): { x: number; y: number }[] => {
    const data: { x: number; y: number }[] = [{ x: 0, y: 0 }]
    let xCounter = 0
    let yCounter = 0
    teamOneActions.forEach((action, index) => {
        if (action.actionType === ActionType.TEAM_ONE_SCORE) {
            xCounter += 1
            yCounter += 10
            data.push({ x: xCounter, y: yCounter })
        } else if (action.actionType === ActionType.TEAM_TWO_SCORE) {
            xCounter += 1
            yCounter -= 10
            data.push({ x: xCounter, y: yCounter })
        } else if (index > 0) {
            if (isTeamOneTurnover(action)) {
                xCounter += 1
                yCounter -= 5
                data.push({ x: xCounter, y: yCounter })
            } else if (isTeamTwoTurnover(action, teamOneActions[index - 1])) {
                xCounter += 1
                yCounter += 5
                data.push({ x: xCounter, y: yCounter })
            }
        }
    })
    return data
}

const isTeamOneTurnover = (action: ServerActionData): boolean => {
    return [ActionType.THROWAWAY, ActionType.DROP, ActionType.STALL].includes(
        action.actionType,
    )
}

const isTeamTwoTurnover = (
    action: ServerActionData,
    prevAction: ServerActionData,
): boolean => {
    if (
        [
            ActionType.PULL,
            ActionType.THROWAWAY,
            ActionType.DROP,
            ActionType.STALL,
        ].includes(prevAction.actionType)
    ) {
        return [ActionType.PICKUP, ActionType.BLOCK].includes(action.actionType)
    }
    return false
}
