import * as Constants from '../../../src/utils/constants'
import * as StatsNetwork from '../../../src/services/network/stats'
import { ApiError } from '../../../src/types/services'
import { getInitialPlayerData } from '../../../fixtures/utils'
import {
    filterPlayerStats,
    getPlayerStats,
} from '../../../src/services/data/stats'

describe('getPlayerStats', () => {
    it('with valid response', async () => {
        const stats = getInitialPlayerData({
            goals: 1,
            assists: 1,
            touches: 4,
            catches: 3,
        })
        jest.spyOn(StatsNetwork, 'getPlayerStats').mockReturnValueOnce(
            Promise.resolve({
                data: { player: stats },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await getPlayerStats('user1')
        expect(result).toMatchObject(stats)
    })

    it('with error', async () => {
        jest.spyOn(StatsNetwork, 'getPlayerStats').mockReturnValueOnce(
            Promise.reject({
                data: { message: Constants.UNABLE_TO_GET_PLAYER_STATS },
                status: 404,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )
        await expect(getPlayerStats('user1')).rejects.toMatchObject(
            new ApiError(Constants.UNABLE_TO_GET_PLAYER_STATS),
        )
    })
})

describe('filterPlayerStats', () => {
    it('with network result', async () => {
        const stats1 = getInitialPlayerData({
            goals: 1,
            assists: 1,
            blocks: 1,
            wins: 1,
        })

        const stats2 = getInitialPlayerData({
            goals: 2,
            throwaways: 1,
            completedPasses: 10,
            losses: 1,
        })
        jest.spyOn(StatsNetwork, 'filterPlayerStats').mockResolvedValueOnce({
            data: {
                stats: [stats1, stats2],
            },
            headers: {},
            config: {},
            status: 200,
            statusText: 'Good',
        })

        const result = await filterPlayerStats('id', [], [])
        expect(result).toMatchObject({
            goals: 3,
            assists: 1,
            blocks: 1,
            wins: 1,
            losses: 1,
            completedPasses: 10,
            throwaways: 1,
            winPercentage: 0.5,
            plusMinus: 4,
        })
    })

    it('with blank network result', async () => {
        jest.spyOn(StatsNetwork, 'filterPlayerStats').mockResolvedValueOnce({
            data: {
                stats: [],
            },
            headers: {},
            config: {},
            status: 200,
            statusText: 'Good',
        })
        const result = await filterPlayerStats('id', [], [])
        expect(result).toMatchObject(getInitialPlayerData({}))
    })

    it('with network error', async () => {
        jest.spyOn(StatsNetwork, 'filterPlayerStats').mockRejectedValue({
            data: {
                error: { message: 'test error' },
            },
            headers: {},
            config: {},
            status: 400,
            statusText: 'Bad',
        })
        await expect(filterPlayerStats('id', [], [])).rejects.toMatchObject({
            message: Constants.UNABLE_TO_GET_PLAYER_STATS,
        })
    })
})
