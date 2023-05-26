import { API_KEY, API_URL_V1 } from '@env'
import axios, { AxiosResponse } from 'axios'

export const getPlayerStats = async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/stats/player/${id}`, {
        headers: {
            'X-API-Key': API_KEY,
        },
    })
}

export const filterPlayerStats = async (
    id: string,
    teams: string[],
    games: string[],
): Promise<AxiosResponse> => {
    let url = `${API_URL_V1}/stats/filter/player/${id}`
    if (teams.length > 0) {
        url += `?teams=${teams.join(',')}`
    }
    if (games.length > 0) {
        if (teams.length > 0) {
            url += `&games=${games.join(',')}`
        } else {
            url += `?games=${games.join(',')}`
        }
    }
    return await axios.get(url, {
        headers: {
            'X-API-Key': API_KEY,
        },
    })
}

export const getGameStats = async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/stats/game/${id}`, {
        headers: { 'X-API-Key': API_KEY },
    })
}

export const getGameStatsByTeam = async (
    gameId: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.get(
        `${API_URL_V1}/stats/filter/game/${gameId}?team=${teamId}`,
        { headers: { 'X-API-Key': API_KEY } },
    )
}

export const getTeamStatsByGame = async (
    teamId: string,
    gameIds: string[],
): Promise<AxiosResponse> => {
    let url = `${API_URL_V1}/stats/filter/${teamId}`
    if (gameIds.length > 0) {
        url += `games=${gameIds.join(',')}`
    }
    return await axios.get(url, { headers: { 'X-API-Key': API_KEY } })
}
