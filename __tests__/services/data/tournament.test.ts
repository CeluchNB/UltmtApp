import * as Constants from '../../../src/utils/constants'
import * as TournamentLocal from '../../../src/services/local/tournament'
import * as TournamentNetwork from '../../../src/services/network/tournament'
import { LocalTournament } from '../../../src/types/tournament'
import { tourney } from '../../../fixtures/data'
import {
    createTournament,
    searchTournaments,
} from '../../../src/services/data/tournament'

describe('tournament data calls', () => {
    describe('creates tournament', () => {
        it('successfully', async () => {
            jest.spyOn(
                TournamentNetwork,
                'createTournament',
            ).mockReturnValueOnce(
                Promise.resolve({
                    data: { tournament: tourney },
                    status: 201,
                    statusText: 'Good',
                    config: {},
                    headers: {},
                }),
            )

            const result = await createTournament({} as LocalTournament)
            expect(result).toMatchObject(tourney)
        })

        it('unsuccessfully', async () => {
            jest.spyOn(
                TournamentNetwork,
                'createTournament',
            ).mockReturnValueOnce(Promise.reject({ message: 'bad tourney' }))

            await expect(
                createTournament({} as LocalTournament),
            ).rejects.toMatchObject({
                message: Constants.CREATE_TOURNAMENT_ERROR,
            })
        })
    })

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
                }),
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