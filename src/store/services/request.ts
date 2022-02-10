import { ApiResponse } from '../../types/services'
import { unwrapResponse } from '../../utils/service-utils'

export const requestTeam = async (
    token: string,
    teamId: string,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/request/user?team=${teamId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    if (response.ok) {
        return { data: await response.json() }
    } else {
        const error = JSON.parse(await response.text())
        return { error }
    }
}

export const requestUser = async (
    token: string,
    userId: string,
    teamId: string,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/request/team/${teamId}?user=${userId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    if (response.ok) {
        return { data: await response.json() }
    } else {
        const error = JSON.parse(await response.text())
        return { error }
    }
}

export const getRequest = async (
    token: string,
    requestId: string,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/request/${requestId}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    return await unwrapResponse(response)
}

export const respondToPlayerRequest = async (
    token: string,
    requestId: string,
    accept: boolean,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/request/team/${
            accept ? 'accept' : 'deny'
        }/${requestId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    return await unwrapResponse(response)
}

export const deleteTeamRequest = async (
    token: string,
    requestId: string,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/request/team/delete/${requestId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )
    return await unwrapResponse(response)
}

export const respondToTeamRequest = async (
    token: string,
    requestId: string,
    accept: boolean,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/request/user/${
            accept ? 'accept' : 'deny'
        }/${requestId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    return await unwrapResponse(response)
}

export const deleteUserRequest = async (
    token: string,
    requestId: string,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/request/user/delete/${requestId}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    return await unwrapResponse(response)
}
