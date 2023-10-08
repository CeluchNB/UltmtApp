import * as Constants from '../../utils/constants'
import { getInitialPlayerData } from '../../../fixtures/utils'
import { throwApiError } from '../../utils/service-utils'
import {
    AllPlayerStats,
    Connection,
    FilteredGameStats,
    FilteredTeamStats,
    GameStats,
    IdentifiedPlayerStats,
    PlayerStats,
} from '../../types/stats'
import { addPlayerStats, calculatePlayerStats } from '../../utils/stats'
import {
    filterConnectionStats as networkFilterConnectionStats,
    filterPlayerStats as networkFilterPlayerStats,
    getGameStats as networkGetGameStats,
    getGameStatsByTeam as networkGetGameStatsByTeam,
    getPlayerStats as networkGetPlayerStats,
    getTeamStats as networkGetTeamStats,
    getTeamStatsByGame as networkGetTeamStatsByGame,
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
): Promise<FilteredGameStats> => {
    try {
        const response = await networkGetGameStatsByTeam(gameId, teamId)
        const { game } = response.data

        return game
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_GET_GAME_STATS)
    }
}

export const getTeamStats = async (
    teamId: string,
    gameIds: string[],
): Promise<FilteredTeamStats> => {
    try {
        let response
        if (gameIds.length > 0) {
            response = await networkGetTeamStatsByGame(teamId, gameIds)
        } else {
            response = await networkGetTeamStats(teamId)
        }

        const { team } = response.data

        return team
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_GET_TEAM_STATS)
    }
}

export const filterConnectionStats = async (
    throwerId: string,
    receiverId: string,
    games: string[],
    teams: string[],
): Promise<Connection> => {
    try {
        const response = await networkFilterConnectionStats(
            throwerId,
            receiverId,
            games,
            teams,
        )
        const { connections } = response.data

        if (connections.length === 0) throw new Error()

        return connections.reduce(
            (prev: Connection, curr: Connection) => {
                return {
                    ...prev,
                    scores: prev.scores + curr.scores,
                    catches: prev.catches + curr.catches,
                    drops: prev.drops + curr.drops,
                }
            },
            {
                throwerId: connections[0].throwerId,
                receiverId: connections[0].receiverId,
                scores: 0,
                catches: 0,
                drops: 0,
            },
        )
    } catch (e) {
        console.log('error', e)
        return throwApiError(e, Constants.UNABLE_TO_GET_CONNECTION_STATS)
    }
}
