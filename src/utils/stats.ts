import {
    AllPlayerStats,
    CalculatedPlayerStats,
    Columns,
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
    if (statIsEfficiency(key)) {
        return Number(value).toPrecision(3)
    }
    if (Number(value) % 1 === 0) {
        return value.toString()
    }
    return Number(value).toFixed(2)
}

const statIsPercentage = (key: string): boolean => {
    return key.toLowerCase().includes('percentage')
}

const statIsEfficiency = (key: string): boolean => {
    return key.toLowerCase().includes('efficiency')
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
        case 'offensePoints':
            return 'Offense Points'
        case 'defensePoints':
            return 'Defense Points'
        case 'offensiveEfficiency':
            return 'Offensive Efficiency'
        case 'defensiveEfficiency':
            return 'Defensive Efficiency'
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
        offensePoints: data1.offensePoints + data2.offensePoints,
        defensePoints: data1.defensePoints + data2.defensePoints,
        holds: data1.holds + data2.holds,
        breaks: data1.breaks + data2.breaks,
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
        offensiveEfficiency: createSafeFraction(
            stats.holds,
            stats.offensePoints,
        ),
        defensiveEfficiency: createSafeFraction(
            stats.breaks,
            stats.defensePoints,
        ),
    }

    return { ...stats, ...calcStats }
}

const createSafeFraction = (numerator: number, denominator: number): number => {
    if (denominator === 0 || !numerator || !denominator) {
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

const calculatePercentageTotals = (totals: { [x: string]: number }) => {
    return {
        catchingPercentage: createSafeFraction(
            totals.catches,
            totals.catches + totals.drops,
        ),
        throwingPercentage: createSafeFraction(
            totals.completedPasses,
            totals.completedPasses + totals.throwaways + totals.droppedPasses,
        ),
        offensiveEfficiency: createSafeFraction(
            totals.holds,
            totals.offensePoints,
        ),
        defensiveEfficiency: createSafeFraction(
            totals.breaks,
            totals.defensePoints,
        ),
    }
}

const calculatePerPointTotals = (totals: { [x: string]: number }) => {
    return {
        ppAssists: createSafeFraction(totals.assists, totals.pointsPlayed),
        ppBlocks: createSafeFraction(totals.blocks, totals.pointsPlayed),
        ppDrops: createSafeFraction(totals.drops, totals.pointsPlayed),
        ppGoals: createSafeFraction(totals.goals, totals.pointsPlayed),
        ppHockeyAssists: createSafeFraction(
            totals.hockeyAssists,
            totals.pointsPlayed,
        ),
        ppThrowaways: createSafeFraction(
            totals.throwaways,
            totals.pointsPlayed,
        ),
    }
}

export const calculateColumnTotals = (
    columns: Columns,
): { [x: string]: number } => {
    const totals: { [x: string]: number } = {}
    for (const col of Object.keys(columns)) {
        if (INVALID_COLUMNS.includes(col)) continue
        totals[col] = 0
        for (const record of columns[col]) {
            totals[col] += Number(record.value)
        }
    }

    return {
        ...totals,
        ...calculatePercentageTotals(totals),
        ...calculatePerPointTotals(totals),
    }
}

export const calculateCompletionsValues = (
    completions: number[],
): { value: number }[] => {
    const data = [
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 },
        { value: 0 },
    ]
    for (const throws of completions) {
        if (throws <= 5) {
            data[0].value += 1
        } else if (throws > 5 && throws <= 10) {
            data[1].value += 1
        } else if (throws > 10 && throws <= 15) {
            data[2].value += 1
        } else if (throws > 15 && throws <= 20) {
            data[3].value += 1
        } else if (throws > 20 && throws <= 25) {
            data[4].value += 1
        } else {
            data[5].value += 1
        }
    }
    return data
}

export const pluralize = (text: string, amount?: number): string => {
    if (amount === 1) {
        return text
    }
    return `${text}s`
}

export const whiteListPlayerStats = (stats: AllPlayerStats): AllPlayerStats => {
    return {
        assists: stats.assists,
        goals: stats.goals,
        catches: stats.catches,
        touches: stats.touches,
        blocks: stats.blocks,
        breaks: stats.breaks,
        callahans: stats.callahans,
        catchingPercentage: stats.catchingPercentage,
        completedPasses: stats.completedPasses,
        defensiveEfficiency: stats.defensiveEfficiency,
        defensePoints: stats.defensePoints,
        droppedPasses: stats.droppedPasses,
        drops: stats.drops,
        hockeyAssists: stats.hockeyAssists,
        holds: stats.holds,
        losses: stats.losses,
        offensiveEfficiency: stats.offensiveEfficiency,
        offensePoints: stats.offensePoints,
        plusMinus: stats.plusMinus,
        pointsPlayed: stats.pointsPlayed,
        ppAssists: stats.ppAssists,
        ppBlocks: stats.ppBlocks,
        ppDrops: stats.ppDrops,
        ppGoals: stats.ppGoals,
        ppThrowaways: stats.ppThrowaways,
        pulls: stats.pulls,
        stalls: stats.stalls,
        throwaways: stats.throwaways,
        throwingPercentage: stats.throwingPercentage,

        winPercentage: stats.winPercentage,
        wins: stats.wins,
    }
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
    'offensePoints',
    'defensePoints',
    'offensiveEfficiency',
    'defensiveEfficiency',
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
