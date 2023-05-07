import {
    AllPlayerStats,
    CalculatedPlayerStats,
    DisplayStat,
    IdentifiedPlayerStats,
    PlayerStats,
} from '../types/stats'

export const convertProfileScreenStatsToStatListItem = (
    stats?: IdentifiedPlayerStats,
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
        case 'ppGoals':
            return 'Goals per point'
        case 'ppAssists':
            return 'Assists per point'
        case 'ppThrowaways':
            return 'Throwaways per point'
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
    console.log('got dropped passes', stats.droppedPasses)
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
