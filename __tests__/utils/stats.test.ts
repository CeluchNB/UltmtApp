import { PlayerStats } from '../../src/types/stats'
import { getInitialPlayerData } from '../../fixtures/utils'
import {
    addPlayerStats,
    calculatePlayerStats,
    convertProfileScreenStatsToStatListItem,
    formatNumber,
    mapStatDisplayName,
} from '../../src/utils/stats'

describe('convertProfileScreenStatsToStatListItem', () => {
    it('with undefined stats', () => {
        const result = convertProfileScreenStatsToStatListItem()
        expect(result.length).toBe(0)
    })

    it('with defined stats', () => {
        const result = convertProfileScreenStatsToStatListItem(
            getInitialPlayerData({
                goals: 1,
                assists: 1,
                plusMinus: 4,
                blocks: 2,
                pointsPlayed: 5,
            }),
        )
        expect(result.length).toBe(4)
        expect(result[0]).toMatchObject({ name: 'Goals', value: 1, points: 5 })
        expect(result[1]).toMatchObject({
            name: 'Assists',
            value: 1,
            points: 5,
        })
        expect(result[2]).toMatchObject({ name: 'Blocks', value: 2, points: 5 })
        expect(result[3]).toMatchObject({ name: '+ / -', value: 4, points: 5 })
    })
})

describe('formatNumber', () => {
    it('returns formatted percentage', () => {
        const result = formatNumber('winPercentage', 0.5)
        expect(result).toBe('50%')
    })

    it('returns whole number', () => {
        const result = formatNumber('goals', 5)
        expect(result).toBe('5')
    })

    it('returns formatted decimal', () => {
        const result = formatNumber('ppGoals', 0.1235432)
        expect(result).toBe('0.12')
    })
})

describe('calculatePlayerStats', () => {
    it('calculates all values', () => {
        const stats: PlayerStats = {
            goals: 1,
            assists: 1,
            hockeyAssists: 0,
            blocks: 1,
            throwaways: 0,
            drops: 1,
            droppedPasses: 0,
            stalls: 0,
            touches: 10,
            catches: 9,
            completedPasses: 0,
            callahans: 0,
            pointsPlayed: 4,
            pulls: 0,
            wins: 4,
            losses: 1,
        }

        const result = calculatePlayerStats(stats)
        expect(result).toMatchObject({
            ...stats,
            winPercentage: 0.8,
            plusMinus: 2,
            catchingPercentage: 0.9,
            throwingPercentage: 0,
            ppGoals: 0.25,
            ppAssists: 0.25,
            ppThrowaways: 0,
            ppDrops: 0.25,
            ppBlocks: 0.25,
        })
    })
})

describe('addPlayerStats', () => {
    it('correctly add stats', () => {
        const stats: PlayerStats = {
            goals: 1,
            assists: 1,
            hockeyAssists: 1,
            blocks: 1,
            throwaways: 0,
            drops: 1,
            droppedPasses: 0,
            stalls: 0,
            touches: 10,
            catches: 9,
            completedPasses: 0,
            callahans: 0,
            pointsPlayed: 4,
            pulls: 0,
            wins: 4,
            losses: 1,
        }
        const result = addPlayerStats(stats, stats)
        const expected: any = {}
        Object.keys(stats).forEach(key => {
            expected[key] = stats[key as keyof PlayerStats] * 2
        })
        expect(result).toMatchObject(expected)
    })
})

describe('mapStatDisplayName', () => {
    it('completedPasses', () => {
        expect(mapStatDisplayName('completedPasses')).toBe('Completed Passes')
    })
    it('droppedPasses', () => {
        expect(mapStatDisplayName('droppedPasses')).toBe('Dropped Passes')
    })
    it('pointsPlayed', () => {
        expect(mapStatDisplayName('pointsPlayed')).toBe('Points Played')
    })
    it('plusMinus', () => {
        expect(mapStatDisplayName('plusMinus')).toBe('Plus / Minus')
    })
    it('catchingPercentage', () => {
        expect(mapStatDisplayName('catchingPercentage')).toBe(
            'Catching Percentage',
        )
    })
    it('throwingPercentage', () => {
        expect(mapStatDisplayName('throwingPercentage')).toBe(
            'Throwing Percentage',
        )
    })
    it('hockeyAssists', () => {
        expect(mapStatDisplayName('hockeyAssists')).toBe('Hockey Assists')
    })
    it('ppGoals', () => {
        expect(mapStatDisplayName('ppGoals')).toBe('Goals per point')
    })
    it('ppAssists', () => {
        expect(mapStatDisplayName('ppAssists')).toBe('Assists per point')
    })
    it('ppDrops', () => {
        expect(mapStatDisplayName('ppDrops')).toBe('Drops per point')
    })
    it('ppThrowaways', () => {
        expect(mapStatDisplayName('ppThrowaways')).toBe('Throwaways per point')
    })
    it('ppBlocks', () => {
        expect(mapStatDisplayName('ppBlocks')).toBe('Blocks per point')
    })
    it('winPercentage', () => {
        expect(mapStatDisplayName('winPercentage')).toBe('Win Percentage')
    })
    it('single work', () => {
        expect(mapStatDisplayName('goals')).toBe('Goals')
    })
})
