import * as ActionLocal from '../../../src/services/local/action'
import * as Constants from '../../../src/utils/constants'
import * as PointServices from '../../../src/services/network/point'
import { AxiosResponse } from 'axios'
import {
    ActionFactory,
    ActionType,
    LiveServerActionData,
    SavedServerActionData,
} from '../../../src/types/action'
import {
    deleteLocalActionsByPoint,
    getLiveActionsByPoint,
    getViewableActionsByPoint,
} from '../../../src/services/data/point'

const action: SavedServerActionData = {
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
    pointId: 'point1',
}

const liveAction: LiveServerActionData = {
    actionNumber: 1,
    comments: [],
    teamNumber: 'one',
    actionType: ActionType.PULL,
    tags: [],
}

afterEach(() => {
    jest.resetAllMocks()
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
            } as AxiosResponse),
        )
        jest.spyOn(ActionLocal, 'getDisplayActions')
            .mockReturnValueOnce(Promise.resolve([]))
            .mockReturnValueOnce(Promise.resolve([action]))
        jest.spyOn(ActionLocal, 'saveDisplayActions').mockReturnValue(
            Promise.resolve(),
        )
        const result = await getViewableActionsByPoint('one', 'point1', [])
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
        jest.spyOn(ActionLocal, 'getDisplayActions').mockReturnValueOnce(
            Promise.resolve([]),
        )

        await expect(
            getViewableActionsByPoint('one', 'point1', []),
        ).resolves.toEqual([])
    })

    it('should handle local success', async () => {
        jest.spyOn(ActionLocal, 'getDisplayActions').mockReturnValueOnce(
            Promise.resolve([action]),
        )

        const result = await getViewableActionsByPoint('one', 'point1', [
            action._id,
        ])
        expect(result).toEqual([ActionFactory.createFromAction(action)])
    })
})

describe('test delete actions', () => {
    it('should handle local success', async () => {
        jest.spyOn(
            ActionLocal,
            'deleteAllDisplayActionsByPoint',
        ).mockReturnValueOnce(Promise.resolve())
        await expect(
            deleteLocalActionsByPoint('pointId'),
        ).resolves.toBeUndefined()
    })

    it('should handle local failure', async () => {
        jest.spyOn(
            ActionLocal,
            'deleteAllDisplayActionsByPoint',
        ).mockReturnValueOnce(Promise.reject())
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
            } as AxiosResponse),
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
