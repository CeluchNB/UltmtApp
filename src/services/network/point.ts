import { DisplayUser } from '../../types/user'
import { API_KEY, API_URL_V1 } from 'react-native-dotenv'
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
    return await axios.put(
        `${API_URL_V1}/point/${pointId}/players`,
        { players },
        {
            headers: {
                'X-API-Key': API_KEY,
                Authorization: `Bearer ${gameToken}`,
            },
        },
    )
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
    team: 'one' | 'two',
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
