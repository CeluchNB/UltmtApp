import * as ActionLocal from '../../../src/services/local/action'
import * as Constants from '../../../src/utils/constants'
import * as LocalPointServices from '../../../src/services/local/point'
import * as PointServices from '../../../src/services/network/point'
import Point from '../../../src/types/point'
import { game } from '../../../fixtures/data'
import {
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
        expect(result).toEqual([action])
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
        expect(result).toEqual([action])
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
        expect(result).toEqual([liveAction])
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
