import * as Constants from '../../../src/utils/constants'
import * as PointServices from '../../../src/services/network/point'
import Point from '../../../src/types/point'
import { ActionType, SavedServerAction } from '../../../src/types/action'
import {
    createPoint,
    finishPoint,
    getActionsByPoint,
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

        expect(createPoint(true, 1)).rejects.toThrow()
    })
})

describe('test set players', () => {
    it('should handle network success', async () => {
        const newPoint = {
            ...point,
            teamOnePlayers: [{ firstName: 'First 1', lastName: 'Last 1' }],
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

        const result = await setPlayers('point1', [
            { firstName: 'First 1', lastName: 'Last 1' },
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

        expect(
            setPlayers('point1', [
                { firstName: 'First 1', lastName: 'Last 1' },
            ]),
        ).rejects.toThrow()
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

        expect(finishPoint('point1')).rejects.toThrow()
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
        const result = await getActionsByPoint('one', 'point1')
        expect(result).toEqual([action])
    })

    it('should handle network failure', () => {
        jest.spyOn(PointServices, 'getActionsByPoint').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(getActionsByPoint('one', 'point1')).rejects.toThrowError(
            Constants.GET_POINT_ERROR,
        )
    })
})
