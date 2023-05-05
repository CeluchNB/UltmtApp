import * as Constants from '../../utils/constants'
import { PlayerStats } from '../../types/stats'
import { throwApiError } from '../../utils/service-utils'
import {
    filterPlayerStats as networkFilterPlayerStats,
    getPlayerStats as networkGetPlayerStats,
} from '../network/stats'

export const getPlayerStats = async (id: string): Promise<PlayerStats> => {
    try {
        const response = await networkGetPlayerStats(id)
        const { player } = response.data
        return player
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_GET_PLAYER_STATS)
    }
}

export const filterPlayerStats = async (
    id: string,
    teams: string[],
    games: string[],
): Promise<PlayerStats[]> => {
    try {
        const response = await networkFilterPlayerStats(id, teams, games)
        const { stats } = response.data
        console.log('got stats', stats)
        return stats
    } catch (e) {
        console.log('got e', e)
        return throwApiError(e, Constants.UNABLE_TO_GET_PLAYER_STATS)
    }
}
