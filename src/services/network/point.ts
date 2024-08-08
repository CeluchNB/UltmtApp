import { ApiError } from '../../types/services'
import { DisplayUser } from '../../types/user'
import { TeamNumber } from '../../types/team'
import { API_KEY, API_URL_V1, API_URL_V2 } from '@env'
import axios, { AxiosResponse } from 'axios'

export const createPoint = async (
    gameToken: string,
    pulling: boolean,
    pointNumber: number,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/point?pulling=${pulling}&number=${pointNumber}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${gameToken}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const setPlayers = async (
    gameToken: string,
    pointId: string,
    players: DisplayUser[],
): Promise<AxiosResponse> => {
    const response = await axios.put(
        `${API_URL_V1}/point/${pointId}/players`,
        { players },
        {
            headers: {
                'X-API-Key': API_KEY,
                Authorization: `Bearer ${gameToken}`,
            },
            validateStatus: () => true,
        },
    )
    if (response.status > 201) {
        throw new ApiError(response.data.message)
    }

    return response
}

export const finishPoint = async (
    gameToken: string,
    pointId: string,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/point/${pointId}/finish`,
        {},
        {
            headers: {
                Authorization: `Bearer ${gameToken}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const getActionsByPoint = async (
    team: TeamNumber,
    pointId: string,
): Promise<AxiosResponse> => {
    return await axios.get(
        `${API_URL_V1}/point/${pointId}/actions?team=${team}`,
        {
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const getLiveActionsByPoint = async (
    gameId: string,
    pointId: string,
): Promise<AxiosResponse> => {
    return await axios.get(
        `${API_URL_V1}/point/${pointId}/live/actions?gameId=${gameId}`,
        {
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const reactivatePoint = async (
    token: string,
    pointId: string,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/point/${pointId}/reactivate`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const deletePoint = async (
    token: string,
    pointId: string,
): Promise<AxiosResponse> => {
    return await axios.delete(`${API_URL_V1}/point/${pointId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': API_KEY,
        },
    })
}

export const setPullingTeam = async (
    token: string,
    pointId: string,
    team: TeamNumber,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/point/${pointId}/pulling?team=${team}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const nextPoint = async (
    gameToken: string,
    pullingTeam: TeamNumber,
    pointNumber: number,
) => {
    const response = await axios.post(
        `${API_URL_V2}/point/next?pullingTeam=${pullingTeam}&pointNumber=${pointNumber}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${gameToken}`,
                'X-API-Key': API_KEY,
            },
            validateStatus: () => true,
        },
    )
    if (response.status > 201) {
        throw new ApiError(response.data.message)
    }

    return response
}

export const backPoint = async (gameToken: string, pointNumber: number) => {
    const response = await axios.put(
        `${API_URL_V2}/point/back?pointNumber=${pointNumber}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${gameToken}`,
                'X-API-Key': API_KEY,
            },
            validateStatus: () => true,
        },
    )
    if (response.status > 201) {
        throw new ApiError(response.data.message)
    }

    return response
}
