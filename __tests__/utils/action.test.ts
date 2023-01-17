import { DisplayUser } from '../../src/types/user'
import {
    ACTION_MAP,
    ActionType,
    LiveServerAction,
    TEAM_ACTION_MAP,
} from '../../src/types/action'

import {
    getAction,
    getValidPlayerActions,
    getValidTeamActions,
    mapActionToDisplayName,
} from '../../src/utils/action'

const playerOne: DisplayUser = {
    _id: 'user1',
    firstName: 'First 1',
    lastName: 'Last 1',
    username: 'firstlast1',
}

const playerTwo: DisplayUser = {
    _id: 'user2',
    firstName: 'First 2',
    lastName: 'Last 2',
    username: 'firstlast2',
}

const getTestAction = (
    overrides?: Partial<LiveServerAction>,
): LiveServerAction => {
    return {
        actionType: ActionType.CATCH,
        actionNumber: 1,
        playerOne,
        playerTwo,
        teamNumber: 'one',
        comments: [],
        tags: [],
        ...overrides,
    }
}

describe('test get player valid actions', () => {
    it('with pulling team', () => {
        const result = getValidPlayerActions('', [], true)
        expect(result).toBe(ACTION_MAP.PULLING)
    })
    it('with receiving team', () => {
        const result = getValidPlayerActions('', [], false)
        expect(result).toBe(ACTION_MAP.RECEIVING)
    })
    it('after pull', () => {
        const stack: LiveServerAction[] = [
            getTestAction({
                actionType: ActionType.PULL,
                playerTwo: undefined,
            }),
        ]
        const result = getValidPlayerActions('user1', stack, true)
        expect(result).toBe(ACTION_MAP.DEFENSE)
    })
    it('after player catch', () => {
        const stack = [getTestAction({ actionType: ActionType.CATCH })]
        const result = getValidPlayerActions('user1', stack, true)
        expect(result).toBe(ACTION_MAP.OFFENSE_WITH_POSSESSION)
    })
    it('after teammate catch', () => {
        const stack = [getTestAction({ actionType: ActionType.CATCH })]
        const result = getValidPlayerActions('user2', stack, true)
        expect(result).toBe(ACTION_MAP.OFFENSE_NO_POSSESSION)
    })
    it('after turnover', () => {
        const stack = [getTestAction({ actionType: ActionType.DROP })]
        const result = getValidPlayerActions('user1', stack, true)
        expect(result).toBe(ACTION_MAP.DEFENSE)
    })
    it('after block', () => {
        const stack = [getTestAction({ actionType: ActionType.BLOCK })]
        const result = getValidPlayerActions('user1', stack, true)
        expect(result).toBe(ACTION_MAP.DEFENSE_AFTER_BLOCK)
    })
    it('after score', () => {
        const stack = [getTestAction({ actionType: ActionType.TEAM_ONE_SCORE })]
        const result = getValidPlayerActions('user1', stack, true)
        expect(result).toBe(ACTION_MAP.AFTER_SCORE)
    })
    it('after timeout', () => {
        const stack = [
            getTestAction(),
            getTestAction({ actionType: ActionType.TIMEOUT }),
        ]
        const result = getValidPlayerActions('user1', stack, true)
        expect(result).toBe(ACTION_MAP.OFFENSE_WITH_POSSESSION)
    })

    it('after substitution of active player', () => {
        const stack = [
            getTestAction({
                actionType: ActionType.CATCH,
            }),
            getTestAction({
                actionType: ActionType.SUBSTITUTION,
                playerTwo: {
                    _id: 'user3',
                    firstName: 'First 3',
                    lastName: 'Last 3',
                    username: 'firstlast3',
                },
            }),
        ]
        const result = getValidPlayerActions('user3', stack, true)
        expect(result).toBe(ACTION_MAP.OFFENSE_WITH_POSSESSION)
    })
})

describe('test get action', () => {
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
