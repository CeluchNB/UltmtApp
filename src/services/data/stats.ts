import * as Constants from '../../utils/constants'
import { getInitialPlayerData } from '../../../fixtures/utils'
import { throwApiError } from '../../utils/service-utils'
import {
    AllPlayerStats,
    GameStats,
    IdentifiedPlayerStats,
    PlayerStats,
} from '../../types/stats'
import { addPlayerStats, calculatePlayerStats } from '../../utils/stats'
import {
    filterPlayerStats as networkFilterPlayerStats,
    getGameStats as networkGetGameStats,
    getGameStatsByTeam as networkGetGameStatsByTeam,
    getPlayerStats as networkGetPlayerStats,
} from '../network/stats'

export const getPlayerStats = async (
    id: string,
): Promise<IdentifiedPlayerStats> => {
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

        const statAggregate: PlayerStats = stats.reduce(
            (a: PlayerStats, b: PlayerStats) => addPlayerStats(a, b),
            getInitialPlayerData({}),
        )
        return calculatePlayerStats(statAggregate)
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_GET_PLAYER_STATS)
    }
}

export const getGameStats = async (id: string): Promise<GameStats> => {
    try {
        const response = await networkGetGameStats(id)
        const { game } = response.data
        return game
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_GET_GAME_STATS)
    }
}

export const getGameStatsByTeam = async (
    gameId: string,
    teamId: string,
): Promise<GameStats> => {
    try {
        const response = await networkGetGameStatsByTeam(gameId, teamId)
        const { game } = response.data

        return game
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_GET_GAME_STATS)
    }
}