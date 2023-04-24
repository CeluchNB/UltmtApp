import { DisplayUser } from '../../src/types/user'
import {
    Action,
    ActionFactory,
    ActionType,
    LiveServerActionData,
    PlayerActionList,
    TeamActionList,
} from '../../src/types/action'

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

const getTestLiveAction = (
    overrides?: Partial<LiveServerActionData>,
): Action => {
    return ActionFactory.createFromAction({
        actionType: ActionType.CATCH,
        actionNumber: 1,
        playerOne,
        playerTwo,
        teamNumber: 'one',
        comments: [],
        tags: [],
        ...overrides,
    })
}

describe('test get player valid actions', () => {
    it('with pulling team', () => {
        const result = new PlayerActionList(playerOne, [], 'one', true)
        expect(result.actionList.length).toBe(1)
        expect(result.actionList[0].action.actionType).toBe(ActionType.PULL)
    })
    it('with receiving team', () => {
        const result = new PlayerActionList(playerOne, [], 'one', false)
        expect(result.actionList.length).toBe(3)
        expect(result.actionList[0].action.actionType).toBe(ActionType.CATCH)
        expect(result.actionList[1].action.actionType).toBe(ActionType.PICKUP)
        expect(result.actionList[2].action.actionType).toBe(ActionType.DROP)
    })
    it('after pull', () => {
        const stack: Action[] = [
            getTestLiveAction({
                actionType: ActionType.PULL,
                playerTwo: undefined,
            }),
        ]
        const result = new PlayerActionList(playerOne, stack, 'one', true)
        expect(result.actionList.length).toBe(3)
        expect(result.actionList[0].action.actionType).toBe(ActionType.BLOCK)
        expect(result.actionList[1].action.actionType).toBe(ActionType.PICKUP)
        expect(result.actionList[2].action.actionType).toBe(
            ActionType.TEAM_ONE_SCORE,
        )
    })

    it('after player catch', () => {
        const stack = [getTestLiveAction({ actionType: ActionType.CATCH })]
        const result = new PlayerActionList(playerOne, stack, 'one', true)
        expect(result.actionList.length).toBe(2)
        expect(result.actionList[0].action.actionType).toBe(
            ActionType.THROWAWAY,
        )
        expect(result.actionList[1].action.actionType).toBe(ActionType.STALL)
    })

    it('after teammate catch', () => {
        const stack = [getTestLiveAction({ actionType: ActionType.CATCH })]
        const result = new PlayerActionList(playerTwo, stack, 'one', true)

        expect(result.actionList.length).toBe(3)
        expect(result.actionList[0].action.actionType).toBe(ActionType.CATCH)
        expect(result.actionList[1].action.actionType).toBe(ActionType.DROP)
        expect(result.actionList[2].action.actionType).toBe(
            ActionType.TEAM_ONE_SCORE,
        )
    })
    it('after turnover', () => {
        const stack = [getTestLiveAction({ actionType: ActionType.DROP })]
        const result = new PlayerActionList(playerOne, stack, 'one', true)
        expect(result.actionList.length).toBe(3)
        expect(result.actionList[0].action.actionType).toBe(ActionType.BLOCK)
        expect(result.actionList[1].action.actionType).toBe(ActionType.PICKUP)
        expect(result.actionList[2].action.actionType).toBe(
            ActionType.TEAM_ONE_SCORE,
        )
    })

    it('after block', () => {
        const stack = [getTestLiveAction({ actionType: ActionType.BLOCK })]
        const result = new PlayerActionList(playerOne, stack, 'one', true)

        expect(result.actionList.length).toBe(1)
        expect(result.actionList[0].action.actionType).toBe(ActionType.PICKUP)
    })

    it('after score', () => {
        const stack = [
            getTestLiveAction({ actionType: ActionType.TEAM_ONE_SCORE }),
        ]
        const result = new PlayerActionList(playerOne, stack, 'one', true)
        expect(result.actionList.length).toBe(0)
    })

    it('after timeout', () => {
        const stack = [
            getTestLiveAction(),
            getTestLiveAction({ actionType: ActionType.TIMEOUT }),
        ]
        const result = new PlayerActionList(playerOne, stack, 'one', true)

        expect(result.actionList.length).toBe(2)
        expect(result.actionList[0].action.actionType).toBe(
            ActionType.THROWAWAY,
        )
        expect(result.actionList.length).toBe(2)
    })

    it('after substitution of active player', () => {
        const stack = [
            getTestLiveAction({
                actionType: ActionType.CATCH,
            }),
            getTestLiveAction({
                actionType: ActionType.SUBSTITUTION,
                playerTwo: {
                    _id: 'user3',
                    firstName: 'First 3',
                    lastName: 'Last 3',
                    username: 'firstlast3',
                },
            }),
        ]
        const result = new PlayerActionList(
            {
                _id: 'user3',
                firstName: 'First 3',
                lastName: 'Last 3',
                username: 'firstlast3',
            },
            stack,
            'one',
            true,
        )

        expect(result.actionList.length).toBe(2)
        expect(result.actionList[0].action.actionType).toBe(
            ActionType.THROWAWAY,
        )
        expect(result.actionList[1].action.actionType).toBe(ActionType.STALL)
    })
})

describe('getValidTeamActions', () => {
    it('prepoint', () => {
        const result = new TeamActionList([], 'one')
        expect(result.actionList.length).toBe(0)
    })

    it('after point', () => {
        const stack = [
            getTestLiveAction({ actionType: ActionType.CATCH }),
            getTestLiveAction({ actionType: ActionType.TEAM_ONE_SCORE }),
        ]
        const result = new TeamActionList(stack, 'one')
        expect(result.actionList.length).toBe(0)
    })

    it('on offense', () => {
        const stack = [
            getTestLiveAction({ actionType: ActionType.CATCH }),
            getTestLiveAction({ actionType: ActionType.CATCH }),
        ]
        const result = new TeamActionList(stack, 'one')

        expect(result.actionList.length).toBe(3)
        expect(result.actionList[0].action.actionType).toBe(ActionType.TIMEOUT)
        expect(result.actionList[1].action.actionType).toBe(
            ActionType.CALL_ON_FIELD,
        )
        expect(result.actionList[2].action.actionType).toBe(
            ActionType.SUBSTITUTION,
        )
    })

    it('on defense', () => {
        const stack = [
            getTestLiveAction({ actionType: ActionType.CATCH }),
            getTestLiveAction({ actionType: ActionType.DROP }),
        ]
        const result = new TeamActionList(stack, 'one')

        expect(result.actionList.length).toBe(3)
        expect(result.actionList[0].action.actionType).toBe(
            ActionType.TEAM_TWO_SCORE,
        )
        expect(result.actionList[1].action.actionType).toBe(
            ActionType.CALL_ON_FIELD,
        )
        expect(result.actionList[2].action.actionType).toBe(
            ActionType.SUBSTITUTION,
        )
    })
})
