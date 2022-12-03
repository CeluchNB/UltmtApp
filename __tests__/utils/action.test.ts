import { ACTION_MAP, ActionType, TEAM_ACTION_MAP } from '../../src/types/action'
import {
    getAction,
    getValidPlayerActions,
    getValidTeamActions,
    mapActionToDisplayName,
} from '../../src/utils/action'

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
        const result = getValidPlayerActions(0, 0, ActionType.PULL, true)
        expect(result).toBe(ACTION_MAP.DEFENSE)
    })
    it('after player catch', () => {
        const result = getValidPlayerActions(0, 0, ActionType.CATCH, true)
        expect(result).toBe(ACTION_MAP.OFFENSE_WITH_POSSESSION)
    })
    it('after teammate catch', () => {
        const result = getValidPlayerActions(0, 1, ActionType.CATCH, true)
        expect(result).toBe(ACTION_MAP.OFFENSE_NO_POSSESSION)
    })
    it('after turnover', () => {
        const result = getValidPlayerActions(0, 0, ActionType.DROP, true)
        expect(result).toBe(ACTION_MAP.DEFENSE)
    })
    it('after block', () => {
        const result = getValidPlayerActions(0, 0, ActionType.BLOCK, true)
        expect(result).toBe(ACTION_MAP.DEFENSE_AFTER_BLOCK)
    })
    it('after score', () => {
        const result = getValidPlayerActions(0, 0, 'score', true)
        expect(result).toBe(ACTION_MAP.AFTER_SCORE)
    })
    it('with bad action', () => {
        const result = getValidPlayerActions(0, 0, ActionType.TIMEOUT, true)
        expect(result).toBe(ACTION_MAP.OFFENSE_NO_POSSESSION)
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

describe('getValidTeamActions', () => {
    it('prepoint', () => {
        const stack = [
            { playerIndex: 0, actionType: ActionType.CATCH },
            { playerIndex: 1, actionType: ActionType.TEAM_ONE_SCORE },
        ]
        const result = getValidTeamActions(stack)
        expect(result).toBe(TEAM_ACTION_MAP.PREPOINT)
    })
    it('on offense', () => {
        const stack = [
            { playerIndex: 0, actionType: ActionType.CATCH },
            { playerIndex: 1, actionType: ActionType.CATCH },
        ]
        const result = getValidTeamActions(stack)
        expect(result).toBe(TEAM_ACTION_MAP.OFFENSE)
    })
    it('on defense', () => {
        const stack = [
            { playerIndex: 0, actionType: ActionType.CATCH },
            { playerIndex: 1, actionType: ActionType.DROP },
        ]
        const result = getValidTeamActions(stack)
        expect(result).toBe(TEAM_ACTION_MAP.DEFENSE)
    })
    it('with empty stack', () => {
        const result = getValidTeamActions([])
        expect(result).toBe(TEAM_ACTION_MAP.PREPOINT)
    })
})

describe('mapActionToDisplayName', () => {
    it('score', () => {
        const result = mapActionToDisplayName('score')
        expect(result).toBe('they score')
    })
    it('call on field', () => {
        const result = mapActionToDisplayName(ActionType.CALL_ON_FIELD)
        expect(result).toBe('call on field')
    })
    it('any other action', () => {
        const result = mapActionToDisplayName(ActionType.CATCH)
        expect(result).toBe(ActionType.CATCH)
    })
})
