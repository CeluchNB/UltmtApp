import { ActionType } from '../../src/types/action'
import { isPulling, isPullingNext } from '../../src/utils/point'

describe('isPulling', () => {
    it('with undefined values', () => {
        const result1 = isPulling(
            undefined,
            { teamOne: { _id: 'test' } },
            'one',
        )
        expect(result1).toBe(false)

        const result2 = isPulling(
            { pullingTeam: { _id: 'test' } },
            undefined,
            'one',
        )
        expect(result2).toBe(false)

        const result3 = isPulling(
            { pullingTeam: { _id: 'test' } },
            undefined,
            'one',
        )
        expect(result3).toBe(false)
    })

    it('with pulling team one', () => {
        const result = isPulling(
            { pullingTeam: { _id: 'one' } },
            { teamOne: { _id: 'one' } },
            'one',
        )

        expect(result).toBe(true)
    })

    it('with pulling team two', () => {
        const result = isPulling(
            { pullingTeam: { _id: 'two' } },
            { teamOne: { _id: 'one' } },
            'two',
        )

        expect(result).toBe(true)
    })

    it('with non-pulling team one', () => {
        const result = isPulling(
            { pullingTeam: { _id: 'two' } },
            { teamOne: { _id: 'one' } },
            'one',
        )

        expect(result).toBe(false)
    })

    it('with non-pulling team two', () => {
        const result = isPulling(
            { pullingTeam: { _id: 'one' } },
            { teamOne: { _id: 'one' } },
            'two',
        )

        expect(result).toBe(false)
    })
})

describe('isPullingNext', () => {
    it('handles team one pulling next', () => {
        const result = isPullingNext('one', ActionType.TEAM_ONE_SCORE)
        expect(result).toBe(true)
    })

    it('handles team one not pulling next', () => {
        const result = isPullingNext('one', ActionType.TEAM_TWO_SCORE)
        expect(result).toBe(false)
    })

    it('handles team two pulling next', () => {
        const result = isPullingNext('two', ActionType.TEAM_TWO_SCORE)
        expect(result).toBe(true)
    })

    it('handles team two not pulling next', () => {
        const result = isPullingNext('two', ActionType.TEAM_ONE_SCORE)
        expect(result).toBe(false)
    })

    it('handles undefined action', () => {
        const result = isPullingNext('two', undefined)
        expect(result).toBe(false)
    })
})
