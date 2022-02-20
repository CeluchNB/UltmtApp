import axios, { AxiosResponse } from 'axios'

export const requestTeam = async (
    token: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `https://ultmt-dev.herokuapp.com/request/user?team=${teamId}`,
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
        `https://ultmt-dev.herokuapp.com/request/team/${teamId}?user=${userId}`,
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
    return await axios.get(
        `https://ultmt-dev.herokuapp.com/request/${requestId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
}

export const respondToPlayerRequest = async (
    token: string,
    requestId: string,
    accept: boolean,
): Promise<AxiosResponse> => {
    return await axios.post(
        `https://ultmt-dev.herokuapp.com/request/team/${
            accept ? 'accept' : 'deny'
        }/${requestId}`,
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
        `https://ultmt-dev.herokuapp.com/request/team/delete/${requestId}`,
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
        `https://ultmt-dev.herokuapp.com/request/user/${
            accept ? 'accept' : 'deny'
        }/${requestId}`,
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
        `https://ultmt-dev.herokuapp.com/request/user/delete/${requestId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
}
