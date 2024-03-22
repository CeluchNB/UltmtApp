import * as Constants from '../../utils/constants'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import { LocalTournament, Tournament } from '../../types/tournament'
import {
    createTournament as localCreateTournament,
    getTournamentById as localGetTournamentById,
    getTournaments as localGetTournaments,
    saveTournaments as localSaveTournaments,
} from '../local/tournament'
import {
    createTournament as networkCreateTournament,
    searchTournaments as networkSearchTournaments,
} from '../network/tournament'

/**
 * Creates a tournament in the backend
 * @param data create tournament data
 * @returns created tournament
 */
export const createTournament = async (
    data: LocalTournament,
): Promise<Tournament> => {
    try {
        let tournamentId = ''
        try {
            const result = await withToken(networkCreateTournament, data)
            const { tournament } = result.data
            tournamentId = await localCreateTournament(tournament)
        } catch (e) {
            tournamentId = await localCreateTournament(data)
        } finally {
            return await localGetTournamentById(tournamentId)
        }
    } catch (e) {
        return throwApiError(e, Constants.CREATE_TOURNAMENT_ERROR)
    }
}

/**
 * Searches locally and over the network for tournaments
 * @param q query string
 * @returns list of tournaments
 */
export const searchTournaments = async (q: string): Promise<Tournament[]> => {
    try {
        if (q.length < 3) {
            throw new Error()
        }
        try {
            const result = await networkSearchTournaments(q)
            const { tournaments: networkTournaments } = result.data
            localSaveTournaments(networkTournaments)
        } finally {
            const tourneys = await localGetTournaments(q)
            return tourneys
        }
    } catch (e) {
        return throwApiError(e, Constants.SEARCH_TOURNAMENT_ERROR)
    }
}
