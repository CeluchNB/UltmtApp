import * as ActionLocal from '../../../src/services/local/action'
import * as Constants from '../../../src/utils/constants'
import * as LocalGameServices from '../../../src/services/local/game'
import * as LocalPointServices from '../../../src/services/local/point'
import * as PointServices from '../../../src/services/network/point'
import Point from '../../../src/types/point'
import { game } from '../../../fixtures/data'
import {
    ActionFactory,
    ActionType,
    LiveServerAction,
    SavedServerAction,
} from '../../../src/types/action'
import {
    createPoint,
    deleteLocalActionsByPoint,
    finishPoint,
    getActionsByPoint,
    getActivePointForGame,
    getLiveActionsByPoint,
    reactivatePoint,
    setPlayers,
} from '../../../src/services/data/point'

const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    teamOneActive: true,
    teamTwoActive: true,
    teamOneActions: [],
    teamTwoActions: [],
    teamOneScore: 0,
    teamTwoScore: 0,
    teamOnePlayers: [],
    teamTwoPlayers: [],
    pullingTeam: { name: 'Team 1' },
    receivingTeam: { name: 'Team 2' },
}

const action: SavedServerAction = {
    _id: 'action1',
    actionNumber: 1,
    comments: [],
    team: {
        _id: 'team1',
        name: 'Team name',
        place: 'Pgh',
        teamname: 'pghteam',
        seasonStart: '2022',
        seasonEnd: '2022',
    },
    actionType: ActionType.PULL,
    tags: [],
}

const liveAction: LiveServerAction = {
    actionNumber: 1,
    comments: [],
    teamNumber: 'one',
    actionType: ActionType.PULL,
    tags: [],
}

afterEach(() => {
    jest.resetAllMocks()
})

describe('test create point', () => {
    it('should handle network success', async () => {
        jest.spyOn(PointServices, 'createPoint').mockReturnValueOnce(
            Promise.resolve({
                data: { point },
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )

        const result = await createPoint(true, 1)
        expect(result).toMatchObject(point)
    })

    it('should handle network failure', async () => {
        jest.spyOn(PointServices, 'createPoint').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(createPoint(true, 1)).rejects.toBeDefined()
    })

    it('offline point', async () => {
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(LocalGameServices, 'activeGameId').mockReturnValueOnce(
            Promise.resolve('game1'),
        )
        jest.spyOn(
            LocalPointServices,
            'createOfflinePoint',
        ).mockReturnValueOnce(Promise.resolve('point1'))
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )

        const result = await createPoint(true, 1)
        expect(result).toMatchObject(point)
    })

    it('with no active game id', async () => {
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        await expect(createPoint(true, 1)).rejects.toMatchObject({
            message: Constants.CREATE_POINT_ERROR,
        })
    })
})

describe('test set players', () => {
    it('should handle network success', async () => {
        const newPoint = {
            ...point,
            teamOnePlayers: [
                {
                    _id: 'user1',
                    firstName: 'First 1',
                    lastName: 'Last 1',
                    username: 'user1',
                },
            ],
        }
        jest.spyOn(PointServices, 'setPlayers').mockReturnValueOnce(
            Promise.resolve({
                data: {
                    point: newPoint,
                },
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(newPoint),
        )

        const result = await setPlayers('point1', [
            {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'user1',
            },
        ])
        expect(result).toMatchObject(newPoint)
    })

    it('should handle network failure', async () => {
        jest.spyOn(PointServices, 'setPlayers').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                config: {},
                headers: {},
            }),
        )

        await expect(
            setPlayers('point1', [
                {
                    _id: 'user1',
                    firstName: 'First 1',
                    lastName: 'Last 1',
                    username: 'firstlast1',
                },
            ]),
        ).rejects.toBeDefined()
    })

    it('offline success', async () => {
        const newPoint = {
            ...point,
            teamOnePlayers: [
                {
                    _id: 'user1',
                    firstName: 'First 1',
                    lastName: 'Last 1',
                    username: 'user1',
                },
            ],
        }
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(Promise.resolve(point))
            .mockReturnValueOnce(Promise.resolve(newPoint))
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        const result = await setPlayers('point1', [
            {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'user1',
            },
        ])
        expect(result).toMatchObject(newPoint)
    })
})

describe('test finish point', () => {
    it('should handle network success', async () => {
        jest.spyOn(PointServices, 'finishPoint').mockReturnValueOnce(
            Promise.resolve({
                data: { point },
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )

        const result = await finishPoint('point1')
        expect(result).toMatchObject(point)
    })

    it('should handle network failure', async () => {
        jest.spyOn(PointServices, 'finishPoint').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(finishPoint('point1')).rejects.toBeDefined()
    })

    it('with offline success team one score', async () => {
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(ActionLocal, 'getActionsByPoint').mockReturnValueOnce(
            Promise.resolve([
                {
                    ...liveAction,
                    actionType: ActionType.TEAM_ONE_SCORE,
                    _id: 'action1',
                    pointId: 'point1',
                },
            ]),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(undefined),
        )

        jest.spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(Promise.resolve(point))
            .mockReturnValueOnce(Promise.resolve(point))

        const result = await finishPoint('point1')
        expect(result).toMatchObject({ ...point, teamOneActive: false })
    })

    it('with offline success team two score', async () => {
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(ActionLocal, 'getActionsByPoint').mockReturnValueOnce(
            Promise.resolve([
                {
                    ...liveAction,
                    actionType: ActionType.TEAM_TWO_SCORE,
                    _id: 'action1',
                    pointId: 'point1',
                },
            ]),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(undefined),
        )

        jest.spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(
                Promise.resolve({ ...point, teamOneActive: true }),
            )
            .mockReturnValueOnce(Promise.resolve(point))

        const result = await finishPoint('point1')
        expect(result).toMatchObject({ ...point, teamOneActive: false })
    })

    it('with offline and team one not active', async () => {
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(ActionLocal, 'getActionsByPoint').mockReturnValueOnce(
            Promise.resolve([
                {
                    ...liveAction,
                    actionType: ActionType.TEAM_TWO_SCORE,
                    _id: 'action1',
                    pointId: 'point1',
                },
            ]),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(undefined),
        )

        jest.spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(
                Promise.resolve({ ...point, teamOneActive: false }),
            )
            .mockReturnValueOnce(
                Promise.resolve({ ...point, teamOneActive: false }),
            )

        const result = await finishPoint('point1')
        expect(result).toMatchObject({ ...point, teamOneActive: false })
    })

    it('with local finish error', async () => {
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockRejectedValueOnce(
            Promise.resolve({ message: Constants.FINISH_POINT_ERROR }),
        )

        await expect(finishPoint('point1')).rejects.toMatchObject({
            message: Constants.FINISH_POINT_ERROR,
        })
    })
})

describe('test get actions by point', () => {
    it('should handle network success', async () => {
        jest.spyOn(PointServices, 'getActionsByPoint').mockReturnValueOnce(
            Promise.resolve({
                data: { actions: [action] },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        jest.spyOn(ActionLocal, 'getActions')
            .mockReturnValueOnce(Promise.resolve([]))
            .mockReturnValueOnce(Promise.resolve([action]))
        jest.spyOn(ActionLocal, 'saveActions').mockReturnValue(
            Promise.resolve(),
        )
        const result = await getActionsByPoint('one', 'point1', [])
        expect(result).toEqual([ActionFactory.createFromAction(action)])
    })

    it('should handle network failure', async () => {
        jest.spyOn(PointServices, 'getActionsByPoint').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )
        jest.spyOn(ActionLocal, 'getActions').mockReturnValueOnce(
            Promise.resolve([]),
        )

        await expect(
            getActionsByPoint('one', 'point1', []),
        ).rejects.toMatchObject({
            message: Constants.GET_POINT_ERROR,
        })
    })

    it('should handle local success', async () => {
        jest.spyOn(ActionLocal, 'getActions').mockReturnValueOnce(
            Promise.resolve([action]),
        )

        const result = await getActionsByPoint('one', 'point1', [action._id])
        expect(result).toEqual([ActionFactory.createFromAction(action)])
    })
})

describe('test delete actions', () => {
    it('should handle local success', async () => {
        jest.spyOn(ActionLocal, 'deleteAllActionsByPoint').mockReturnValueOnce(
            Promise.resolve(),
        )
        await expect(
            deleteLocalActionsByPoint('pointId'),
        ).resolves.toBeUndefined()
    })

    it('should handle local failure', async () => {
        jest.spyOn(ActionLocal, 'deleteAllActionsByPoint').mockReturnValueOnce(
            Promise.reject(),
        )
        await expect(
            deleteLocalActionsByPoint('pointId'),
        ).resolves.toBeUndefined()
    })
})

describe('test get live actions by point', () => {
    it('should handle network success', async () => {
        jest.spyOn(PointServices, 'getLiveActionsByPoint').mockReturnValueOnce(
            Promise.resolve({
                data: { actions: [liveAction] },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        const result = await getLiveActionsByPoint('one', 'point1')
        expect(result).toEqual([ActionFactory.createFromAction(liveAction)])
    })

    it('should handle network failure', async () => {
        jest.spyOn(PointServices, 'getLiveActionsByPoint').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(getLiveActionsByPoint('', '')).rejects.toMatchObject({
            message: Constants.GET_POINT_ERROR,
        })
    })
})

describe('test get active point for game', () => {
    it('with no points', async () => {
        const result = await getActivePointForGame({ ...game, points: [] })
        expect(result).toBeUndefined()
    })

    it('with two points', async () => {
        jest.spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(Promise.resolve({ ...point, pointNumber: 2 }))
            .mockReturnValueOnce(Promise.resolve({ ...point, pointNumber: 1 }))
        const result = await getActivePointForGame({
            ...game,
            points: ['point1', 'point2'],
        })
        expect(result).toMatchObject({ ...point, pointNumber: 2 })
    })

    it('with error', async () => {
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.reject({ message: 'test error' }),
        )
        await expect(
            getActivePointForGame({
                ...game,
                points: ['point1', 'point2'],
            }),
        ).rejects.toMatchObject({ message: Constants.GET_POINT_ERROR })
    })
})

describe('test reactivate point', () => {
    beforeEach(() => {
        jest.spyOn(LocalGameServices, 'activeGameId').mockReturnValue(
            Promise.resolve('game1'),
        )

        jest.spyOn(LocalPointServices, 'getPointByPointNumber').mockReturnValue(
            Promise.resolve(point),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValue(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalPointServices, 'deletePoint').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValue(
            Promise.resolve(point),
        )
    })
    it('with online game', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValue(
            Promise.resolve({ ...game, offline: false }),
        )
        const deleteSpy = jest
            .spyOn(PointServices, 'deletePoint')
            .mockReturnValue(
                Promise.resolve({
                    data: {},
                    status: 200,
                    statusText: 'good',
                    config: {},
                    headers: {},
                }),
            )
        const reactivateSpy = jest
            .spyOn(PointServices, 'reactivatePoint')
            .mockReturnValue(
                Promise.resolve({
                    data: { point },
                    status: 200,
                    statusText: 'Good',
                    config: {},
                    headers: {},
                }),
            )
        const getActionsSpy = jest
            .spyOn(PointServices, 'getLiveActionsByPoint')
            .mockReturnValue(
                Promise.resolve({
                    data: { actions: [liveAction] },
                    status: 200,
                    statusText: 'Good',
                    config: {},
                    headers: {},
                }),
            )
        jest.spyOn(ActionLocal, 'deleteEditableActionsByPoint').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(ActionLocal, 'saveMultipleServerActions').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(ActionLocal, 'getActionsByPoint').mockReturnValue(
            Promise.resolve([
                { ...liveAction, _id: 'action1', pointId: point._id },
            ]),
        )

        const result = await reactivatePoint('point1', 1, 'one')
        expect(deleteSpy).toHaveBeenCalled()
        expect(reactivateSpy).toHaveBeenCalled()
        expect(getActionsSpy).toHaveBeenCalled()
        expect(result).toMatchObject(point)

        jest.clearAllMocks()
        const result2 = await reactivatePoint('point1', 1, 'two')
        expect(deleteSpy).toHaveBeenCalled()
        expect(reactivateSpy).toHaveBeenCalled()
        expect(getActionsSpy).toHaveBeenCalled()
        expect(result2).toMatchObject(point)
    })

    it('with offline point', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValue(
            Promise.resolve({ ...game, offline: true }),
        )

        const result = await reactivatePoint('point1', 1, 'one')
        expect(result).toMatchObject(point)

        const result2 = await reactivatePoint('point1', 2, 'one')
        expect(result2).toMatchObject(point)
    })

    it('with offline point error', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValue(
            Promise.resolve({ ...game, offline: true }),
        )
        jest.spyOn(LocalPointServices, 'getPointByPointNumber')
            .mockReset()
            .mockReturnValueOnce(Promise.resolve(point))

        await expect(reactivatePoint('point1', 2, 'one')).rejects.toMatchObject(
            { message: Constants.GET_POINT_ERROR },
        )
    })

    it('with error case', async () => {
        jest.resetAllMocks()
        jest.spyOn(LocalGameServices, 'activeGameId').mockReturnValue(
            Promise.resolve('game1'),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValue(
            Promise.resolve({ ...game, offline: false }),
        )

        await expect(reactivatePoint('point1', 1, 'one')).rejects.toMatchObject(
            { message: Constants.GET_POINT_ERROR },
        )
    })
})
