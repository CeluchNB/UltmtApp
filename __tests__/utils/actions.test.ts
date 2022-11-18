import { ACTION_MAP } from '../../src/types/action'
import { getPlayerValidActions } from '../../src/utils/actions'

describe('test get player valid actions', () => {
    it('with pulling team', () => {
        const result = getPlayerValidActions(0, 0, undefined, true)
        expect(result).toBe(ACTION_MAP.PULLING)
    })
    it('with receiving team', () => {
        const result = getPlayerValidActions(0, 0, undefined, false)
        expect(result).toBe(ACTION_MAP.RECEIVING)
    })
    it('after pull', () => {
        const result = getPlayerValidActions(0, 0, 'Pull', true)
        expect(result).toBe(ACTION_MAP.DEFENSE)
    })
    it('after player catch', () => {
        const result = getPlayerValidActions(0, 0, 'Catch', true)
        expect(result).toBe(ACTION_MAP.OFFENSE_WITH_POSSESSION)
    })
    it('after teammate catch', () => {
        const result = getPlayerValidActions(0, 1, 'Catch', true)
        expect(result).toBe(ACTION_MAP.OFFENSE_NO_POSSESSION)
    })
    it('after turnover', () => {
        const result = getPlayerValidActions(0, 0, 'Drop', true)
        expect(result).toBe(ACTION_MAP.DEFENSE)
    })
    it('after block', () => {
        const result = getPlayerValidActions(0, 0, 'Block', true)
        expect(result).toBe(ACTION_MAP.DEFENSE_AFTER_BLOCK)
    })
})
