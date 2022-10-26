import { API_KEY, API_URL_V1 } from 'react-native-dotenv'
import axios, { AxiosResponse } from 'axios'

export const requestTeam = async (
    token: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/request/user?team=${teamId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const requestUser = async (
    token: string,
    userId: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/request/team/${teamId}?user=${userId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const getRequest = async (
    token: string,
    requestId: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/request/${requestId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': API_KEY,
        },
    })
}

export const respondToPlayerRequest = async (
    token: string,
    requestId: string,
    accept: boolean,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/request/team/${accept ? 'accept' : 'deny'}/${requestId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const deleteTeamRequest = async (
    token: string,
    requestId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/request/team/delete/${requestId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const respondToTeamRequest = async (
    token: string,
    requestId: string,
    accept: boolean,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/request/user/${accept ? 'accept' : 'deny'}/${requestId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const deleteUserRequest = async (
    token: string,
    requestId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/request/user/delete/${requestId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const getRequestsByTeam = async (
    token: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/request/team/${teamId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': API_KEY,
        },
    })
}

export const getRequestsByUser = async (
    token: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/request/userRequests`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': API_KEY,
        },
    })
}
