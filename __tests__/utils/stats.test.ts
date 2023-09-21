import { PlayerStats } from '../../src/types/stats'
import { getInitialPlayerData } from '../../fixtures/utils'
import {
    addPlayerStats,
    calculateColumnTotals,
    calculateCompletionsValues,
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
    it('ppHockeyAssists', () => {
        expect(mapStatDisplayName('ppHockeyAssists')).toBe(
            'Hockey Assists per point',
        )
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

describe('calculateColumnTotals', () => {
    it('handles caclulation', () => {
        const result = calculateColumnTotals({
            assists: [
                { _id: '1', value: 3 },
                { _id: '2', value: 2 },
            ],
            blocks: [
                { _id: '1', value: 1 },
                { _id: '2', value: 1 },
            ],
            goals: [
                { _id: '1', value: 2 },
                { _id: '2', value: 1 },
            ],
            completedPasses: [
                { _id: '1', value: 4 },
                { _id: '2', value: 5 },
            ],
            throwaways: [
                { _id: '1', value: 0 },
                { _id: '2', value: 4 },
            ],
            droppedPasses: [
                { _id: '1', value: 0 },
                { _id: '2', value: 0 },
            ],
            plusMinus: [
                { _id: '1', value: 2 },
                { _id: '2', value: -1 },
            ],
            pointsPlayed: [
                { _id: '1', value: 5 },
                { _id: '2', value: 3 },
            ],
        })
        expect(result).toMatchObject({
            assists: 5,
            blocks: 2,
            goals: 3,
            throwaways: 4,
            plusMinus: 1,
            completedPasses: 9,
            pointsPlayed: 8,
            ppAssists: 5 / 8,
            ppBlocks: 0.25,
            ppDrops: 0,
            ppGoals: 3 / 8,
            ppThrowaways: 0.5,
            ppHockeyAssists: 0,
            throwingPercentage: 9 / 13,
        })
    })
})

describe('calculateCompletionsValues', () => {
    it('calculates correct values', () => {
        const result = calculateCompletionsValues([
            3, 4, 19, 26, 13, 18, 7, 20, 19, 22,
        ])
        expect(result).toEqual([
            { value: 2 },
            { value: 1 },
            { value: 1 },
            { value: 4 },
            { value: 1 },
            { value: 1 },
        ])
    })

    it('calculates with no values', () => {
        const result = calculateCompletionsValues([])
        expect(result).toEqual([
            { value: 0 },
            { value: 0 },
            { value: 0 },
            { value: 0 },
            { value: 0 },
            { value: 0 },
        ])
    })
})
