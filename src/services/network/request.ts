import { API_URL_V1 } from 'react-native-dotenv'
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
        },
    })
}

export const getRequestsByUser = async (
    token: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/request/userRequests`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}
