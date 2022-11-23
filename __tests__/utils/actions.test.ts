import { ACTION_MAP, ActionType } from '../../src/types/action'
import { getAction, getValidPlayerActions } from '../../src/utils/actions'

describe('test get player valid actions', () => {
    it('with pulling team', () => {
        const result = getValidPlayerActions(0, 0, undefined, true)
        expect(result).toBe(ACTION_MAP.PULLING)
    })
    it('with receiving team', () => {
        const result = getValidPlayerActions(0, 0, undefined, false)
        expect(result).toBe(ACTION_MAP.RECEIVING)
    })
    it('after pull', () => {
        const result = getValidPlayerActions(0, 0, 'Pull', true)
        expect(result).toBe(ACTION_MAP.DEFENSE)
    })
    it('after player catch', () => {
        const result = getValidPlayerActions(0, 0, 'Catch', true)
        expect(result).toBe(ACTION_MAP.OFFENSE_WITH_POSSESSION)
    })
    it('after teammate catch', () => {
        const result = getValidPlayerActions(0, 1, 'Catch', true)
        expect(result).toBe(ACTION_MAP.OFFENSE_NO_POSSESSION)
    })
    it('after turnover', () => {
        const result = getValidPlayerActions(0, 0, 'Drop', true)
        expect(result).toBe(ACTION_MAP.DEFENSE)
    })
    it('after block', () => {
        const result = getValidPlayerActions(0, 0, 'Block', true)
        expect(result).toBe(ACTION_MAP.DEFENSE_AFTER_BLOCK)
    })
})

describe('test get action', () => {
    const playerOne = { firstName: 'First 1', lastName: 'Last 1' }
    const playerTwo = { firstName: 'First 2', lastName: 'Last 2' }
    it('with team one score and two players', () => {
        const result = getAction('score', 'one', ['tag'], playerOne, playerTwo)
        expect(result).toMatchObject({
            actionType: ActionType.TEAM_ONE_SCORE,
            playerOne,
            playerTwo,
            tags: ['tag'],
        })
    })

    it('with team two score and two players', () => {
        const result = getAction('score', 'two', ['tag'], playerOne, playerTwo)
        expect(result).toMatchObject({
            actionType: ActionType.TEAM_TWO_SCORE,
            playerOne,
            playerTwo,
            tags: ['tag'],
        })
    })

    it('with single player action', () => {
        const result = getAction(
            ActionType.PULL,
            'one',
            ['tag'],
            playerOne,
            playerTwo,
        )
        expect(result).toMatchObject({
            actionType: ActionType.PULL,
            playerOne,
            tags: ['tag'],
        })
    })
})
