import * as Constants from '../../utils/constants'
import { PlayerStats } from '../../types/stats'
import { getPlayerStats as networkGetPlayerStats } from '../network/stats'
import { throwApiError } from '../../utils/service-utils'

export const getPlayerStats = async (id: string): Promise<PlayerStats> => {
    try {
        const response = await networkGetPlayerStats(id)
        const { player } = response.data
        return player
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_GET_PLAYER_STATS)
    }
}
