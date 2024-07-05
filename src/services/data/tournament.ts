import * as Constants from '../../utils/constants'
import { Tournament } from '../../types/tournament'
import { searchTournaments as networkSearchTournaments } from '../network/tournament'
import { throwApiError } from '../../utils/service-utils'
import {
    getTournaments as localGetTournaments,
    saveTournaments as localSaveTournaments,
} from '../local/tournament'

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
            const response = await networkSearchTournaments(q)
            const { tournaments: networkTournaments } = response.data
            localSaveTournaments(networkTournaments)
        } finally {
            const tourneys = await localGetTournaments(q)
            return tourneys
        }
    } catch (e) {
        return throwApiError(e, Constants.SEARCH_TOURNAMENT_ERROR)
    }
}
