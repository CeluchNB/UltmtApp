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
