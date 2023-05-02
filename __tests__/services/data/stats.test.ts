import * as Constants from '../../../src/utils/constants'
import * as StatsNetwork from '../../../src/services/network/stats'
import { ApiError } from '../../../src/types/services'
import { getInitialPlayerData } from '../../../fixtures/utils'
import { getPlayerStats } from '../../../src/services/data/stats'

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
