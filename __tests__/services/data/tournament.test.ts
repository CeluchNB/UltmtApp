import * as Constants from '../../../src/utils/constants'
import * as TournamentLocal from '../../../src/services/local/tournament'
import * as TournamentNetwork from '../../../src/services/network/tournament'
import { AxiosResponse } from 'axios'
import { searchTournaments } from '../../../src/services/data/tournament'
import { tourney } from '../../../fixtures/data'

describe('tournament data calls', () => {
    describe('searches tournaments', () => {
        it('successfully', async () => {
            jest.spyOn(
                TournamentNetwork,
                'searchTournaments',
            ).mockReturnValueOnce(
                Promise.resolve({
                    data: { tournaments: [tourney] },
                    status: 200,
                    statusText: 'Good',
                    headers: {},
                    config: {},
                } as AxiosResponse),
            )
            jest.spyOn(TournamentLocal, 'saveTournaments').mockReturnValueOnce(
                Promise.resolve(),
            )
            jest.spyOn(TournamentLocal, 'getTournaments').mockReturnValueOnce(
                Promise.resolve([tourney]),
            )

            const result = await searchTournaments('tourney')
            expect(result.length).toBe(1)
            expect(result[0]).toMatchObject(tourney)
        })

        it('unsuccessfully', async () => {
            await expect(searchTournaments('te')).rejects.toMatchObject({
                message: Constants.SEARCH_TOURNAMENT_ERROR,
            })
        })
    })
})
