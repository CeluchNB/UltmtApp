import { convertProfileScreenStatsToStatListItem } from '../../src/utils/stats'
import { getInitialPlayerData } from '../../fixtures/utils'

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
