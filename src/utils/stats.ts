import { DisplayStat, PlayerStats } from '../types/stats'

export const convertProfileScreenStatsToStatListItem = (
    stats?: PlayerStats,
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
