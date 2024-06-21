import { GuestUser } from '../../types/user'
import { addQueryParam } from '../../utils/service-utils'
import { API_KEY, API_URL_V1, API_URL_V2 } from '@env'
import { CreateFullGame, CreateGame, UpdateGame } from '../../types/game'
import axios, { AxiosResponse } from 'axios'

export const searchGames = async (
    q?: string,
    live?: boolean,
    after?: string,
    before?: string,
    pageSize?: number,
    offset?: number,
): Promise<AxiosResponse> => {
    let url = `${API_URL_V1}/game/search`
    url = addQueryParam(url, 'q', q)
    url = addQueryParam(url, 'live', live)
    url = addQueryParam(url, 'after', after)
    url = addQueryParam(url, 'before', before)
    url = addQueryParam(url, 'pageSize', pageSize)
    url = addQueryParam(url, 'offset', offset)
    return await axios.get(url, {
        headers: { 'X-API-Key': API_KEY },
    })
}

export const createGame = async (
    token: string,
    data: CreateGame,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/game`,
        { createGameData: data },
        {
            headers: { 'X-API-Key': API_KEY, Authorization: `Bearer ${token}` },
            validateStatus: () => true,
        },
    )
}

export const addGuestPlayer = async (
    token: string,
    player: GuestUser,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/game/player/guest`,
        { player },
        { headers: { 'X-API-Key': API_KEY, Authorization: `Bearer ${token}` } },
    )
}

export const updateGamePlayers = async (
    token: string,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/game/update-players`,
        {},
        {
            headers: { 'X-API-Key': API_KEY, Authorization: `Bearer ${token}` },
        },
    )
}

export const getPointsByGame = async (
    gameId: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/game/${gameId}/points`, {
        headers: { 'X-API-Key': API_KEY },
    })
}

export const getGameById = async (gameId: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/game/${gameId}`, {
        headers: { 'X-API-Key': API_KEY },
    })
}

export const joinGame = async (
    token: string,
    gameId: string,
    teamId: string,
    code: string,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/game/${gameId}/resolve?team=${teamId}&otp=${code}`,
        {},
        {
            headers: {
                'X-API-Key': API_KEY,
                authorization: `Bearer ${token}`,
            },
        },
    )
}

export const finishGame = async (token: string) => {
    return await axios.put(
        `${API_URL_V2}/game/finish`,
        {},
        {
            headers: {
                'X-API-Key': API_KEY,
                authorization: `Bearer ${token}`,
            },
            validateStatus: () => true,
        },
    )
}

export const getGamesByTeam = async (teamId: string) => {
    return await axios.get(`${API_URL_V1}/game/team/${teamId}`, {
        headers: {
            'X-API-Key': API_KEY,
        },
    })
}

export const reactivateGame = async (
    userJwt: string,
    gameId: string,
    teamId: string,
) => {
    return await axios({
        url: `${API_URL_V2}/game/${gameId}/reactivate?team=${teamId}`,
        method: 'PUT',
        headers: {
            'X-API-Key': API_KEY,
            Authorization: `Bearer ${userJwt}`,
        },
    })
}

export const reenterGame = async (
    userJwt: string,
    gameId: string,
    teamId: string,
) => {
    return await axios.put(
        `${API_URL_V2}/game/${gameId}/reenter`,
        { teamId },
        {
            headers: {
                'X-API-Key': API_KEY,
                Authorization: `Bearer ${userJwt}`,
            },
        },
    )
}

export const pushOfflineGame = async (
    token: string,
    gameData: CreateFullGame,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/game/full`,
        {
            gameData,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const deleteGame = async (
    userJwt: string,
    gameId: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.delete(`${API_URL_V1}/game/${gameId}?team=${teamId}`, {
        headers: {
            'X-API-Key': API_KEY,
            Authorization: `Bearer ${userJwt}`,
        },
        validateStatus: () => true,
    })
}

export const editGame = async (
    token: string,
    gameData: UpdateGame,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/game`,
        {
            gameData,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
            validateStatus: () => true,
        },
    )
}

export const logGameOpen = async (gameId: string): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/game/${gameId}/open`,
        {},
        {
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
}
