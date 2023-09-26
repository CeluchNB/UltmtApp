import { nameSort } from '../../src/utils/player'

describe('nameSort', () => {
    it('correct result with greater than', () => {
        const result = nameSort(
            {
                _id: 'noah',
                firstName: 'Noah',
                lastName: 'Celuch',
                username: 'noah',
            },
            {
                _id: 'alex',
                firstName: 'alex',
                lastName: 'test',
                username: 'alex',
            },
        )
        expect(result).toBeGreaterThan(0)
    })

    it('correctly sort with less than', () => {
        const result = nameSort(
            {
                _id: 'alex',
                firstName: 'alex',
                lastName: 'test',
                username: 'alex',
            },
            {
                _id: 'noah',
                firstName: 'Noah',
                lastName: 'Celuch',
                username: 'noah',
            },
        )
        expect(result).toBeLessThan(0)
    })
})
