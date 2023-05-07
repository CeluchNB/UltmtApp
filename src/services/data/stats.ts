import * as Constants from '../../utils/constants'
import { throwApiError } from '../../utils/service-utils'
import { AllPlayerStats, PlayerStats } from '../../types/stats'
import { addPlayerStats, calculatePlayerStats } from '../../utils/stats'
import {
    filterPlayerStats as networkFilterPlayerStats,
    getPlayerStats as networkGetPlayerStats,
} from '../network/stats'

export const getPlayerStats = async (id: string): Promise<AllPlayerStats> => {
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
): Promise<AllPlayerStats> => {
    try {
        const response = await networkFilterPlayerStats(id, teams, games)
        const { stats } = response.data
        console.log('got result', stats)

        const statAggregate: PlayerStats = stats.reduce(
            (a: PlayerStats, b: PlayerStats) => addPlayerStats(a, b),
        )
        return calculatePlayerStats(statAggregate)
    } catch (e) {
        console.log('got e', e)
        return throwApiError(e, Constants.UNABLE_TO_GET_PLAYER_STATS)
    }
}
