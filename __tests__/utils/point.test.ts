import { ActionType, LiveServerAction } from '../../src/types/action'
import {
    isPulling,
    isPullingNext,
    normalizeActions,
} from '../../src/utils/point'

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

describe('normalizeActions', () => {
    let action1: LiveServerAction
    let action2: LiveServerAction
    let action3: LiveServerAction
    beforeEach(() => {
        action1 = {
            actionNumber: 1,
            actionType: ActionType.PULL,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        action2 = {
            actionNumber: 2,
            actionType: ActionType.BLOCK,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        action3 = {
            actionNumber: 3,
            actionType: ActionType.PICKUP,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
    })

    it('team one pull -> block -> pickup', () => {
        const result = normalizeActions([action1, action1, action3, action2])
        expect(result.length).toBe(3)
        expect(result[0]).toMatchObject(action1)
        expect(result[1]).toMatchObject(action2)
        expect(result[2]).toMatchObject(action3)
    })

    it('team two pull -> block -> pickup', () => {
        action1.teamNumber = 'two'
        action2.teamNumber = 'two'
        action3.teamNumber = 'two'
        const result = normalizeActions([action1, action1, action3, action2])
        expect(result.length).toBe(3)
        expect(result[0]).toMatchObject(action1)
        expect(result[1]).toMatchObject(action2)
        expect(result[2]).toMatchObject(action3)
    })

    it('team one pickup -> catch -> catch', () => {
        action1.actionType = ActionType.PICKUP
        action2.actionType = ActionType.CATCH
        action3.actionType = ActionType.CATCH

        const result = normalizeActions([action3, action2, action1])
        expect(result[0]).toMatchObject(action1)
        expect(result[1]).toMatchObject(action2)
        expect(result[2]).toMatchObject(action3)
    })

    it('team two pickup -> catch -> catch', () => {
        action1.actionType = ActionType.PICKUP
        action1.teamNumber = 'two'
        action2.actionType = ActionType.CATCH
        action2.teamNumber = 'two'
        action3.actionType = ActionType.CATCH
        action3.teamNumber = 'two'

        const result = normalizeActions([action3, action2, action1])
        expect(result[0]).toMatchObject(action1)
        expect(result[1]).toMatchObject(action2)
        expect(result[2]).toMatchObject(action3)
    })

    it('team one drop -> pickup -> catch', () => {
        action1.actionType = ActionType.DROP
        action2.actionType = ActionType.PICKUP
        action3.actionType = ActionType.CATCH

        const result = normalizeActions([action3, action2, action1])
        expect(result[0]).toMatchObject(action1)
        expect(result[1]).toMatchObject(action2)
        expect(result[2]).toMatchObject(action3)
    })

    it('team two drop -> pickup -> catch', () => {
        action1.actionType = ActionType.DROP
        action1.teamNumber = 'two'
        action2.actionType = ActionType.PICKUP
        action2.teamNumber = 'two'
        action3.actionType = ActionType.CATCH
        action3.teamNumber = 'two'

        const result = normalizeActions([action3, action2, action1])
        expect(result[0]).toMatchObject(action1)
        expect(result[1]).toMatchObject(action2)
        expect(result[2]).toMatchObject(action3)
    })

    it('team one pull, team two catch -> catch -> throwaway, team one pickup -> catch', () => {
        const a11: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.PULL,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a21: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.CATCH,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a22: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.CATCH,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a23: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.THROWAWAY,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a12: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.PICKUP,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a13: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.CATCH,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }

        const result = normalizeActions([a11, a12, a13, a13, a21, a22, a23])
        expect(result[0]).toMatchObject(a11)
        expect(result[1]).toMatchObject(a21)
        expect(result[2]).toMatchObject(a22)
        expect(result[3]).toMatchObject(a23)
        expect(result[4]).toMatchObject(a12)
        expect(result[5]).toMatchObject(a13)
    })

    it('team two pull, team one catch -> catch -> drop, team two pickup -> catch', () => {
        const a21: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.PULL,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a11: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.CATCH,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a12: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.CATCH,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a13: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.DROP,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a22: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.PICKUP,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a23: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.CATCH,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }

        const result = normalizeActions([
            a13,
            a12,
            a13,
            a11,
            a21,
            a22,
            a23,
            a22,
        ])
        expect(result[0]).toMatchObject(a21)
        expect(result[1]).toMatchObject(a11)
        expect(result[2]).toMatchObject(a12)
        expect(result[3]).toMatchObject(a13)
        expect(result[4]).toMatchObject(a22)
        expect(result[5]).toMatchObject(a23)
    })

    it('team one drop, team two pickup -> catch -> drop, team one pickup -> catch -> catch', () => {
        const a11: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.DROP,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a21: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.PICKUP,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a22: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.CATCH,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a23: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.DROP,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a12: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.PICKUP,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a13: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.CATCH,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a14: LiveServerAction = {
            actionNumber: 4,
            actionType: ActionType.CATCH,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const result = normalizeActions([a14, a23, a13, a22, a12, a21, a11])
        expect(result[0]).toMatchObject(a11)
        expect(result[1]).toMatchObject(a21)
        expect(result[2]).toMatchObject(a22)
        expect(result[3]).toMatchObject(a23)
        expect(result[4]).toMatchObject(a12)
        expect(result[5]).toMatchObject(a13)
        expect(result[6]).toMatchObject(a14)
    })

    it('team two drop, team one pickup -> catch -> drop, team two pickup -> catch -> catch', () => {
        const a21: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.DROP,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a11: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.PICKUP,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a12: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.CATCH,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a13: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.DROP,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a22: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.PICKUP,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a23: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.CATCH,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a24: LiveServerAction = {
            actionNumber: 4,
            actionType: ActionType.CATCH,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const result = normalizeActions([a24, a23, a13, a22, a12, a21, a11])
        expect(result[0]).toMatchObject(a21)
        expect(result[1]).toMatchObject(a11)
        expect(result[2]).toMatchObject(a12)
        expect(result[3]).toMatchObject(a13)
        expect(result[4]).toMatchObject(a22)
        expect(result[5]).toMatchObject(a23)
        expect(result[6]).toMatchObject(a24)
    })

    it('team one pull, team two drop, team one pickup -> score', () => {
        const a11: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.PULL,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a21: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.DROP,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a12: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.PICKUP,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a13: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.TEAM_ONE_SCORE,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }

        const result = normalizeActions([a21, a11, a12, a13, a11])
        expect(result[0]).toMatchObject(a11)
        expect(result[1]).toMatchObject(a21)
        expect(result[2]).toMatchObject(a12)
        expect(result[3]).toMatchObject(a13)
    })

    it('team two pull, team one drop, team two pickup -> score', () => {
        const a21: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.PULL,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a11: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.DROP,
            teamNumber: 'one',
            tags: [],
            comments: [],
        }
        const a22: LiveServerAction = {
            actionNumber: 2,
            actionType: ActionType.PICKUP,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }
        const a23: LiveServerAction = {
            actionNumber: 3,
            actionType: ActionType.TEAM_ONE_SCORE,
            teamNumber: 'two',
            tags: [],
            comments: [],
        }

        const result = normalizeActions([a21, a11, a22, a23, a11])
        expect(result[0]).toMatchObject(a21)
        expect(result[1]).toMatchObject(a11)
        expect(result[2]).toMatchObject(a22)
        expect(result[3]).toMatchObject(a23)
    })
})
