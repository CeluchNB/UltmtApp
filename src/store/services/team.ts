import { ApiResponse } from '../../types/services'
import { CreateTeam } from '../../types/team'
import { unwrapResponse } from '../../utils/service-utils'

export const createTeam = async (
    token: string,
    data: CreateTeam,
): Promise<ApiResponse> => {
    const response = await fetch('https://ultmt-dev.herokuapp.com/team', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            team: {
                ...data,
            },
        }),
    })

    return unwrapResponse(response)
}

export const searchTeam = async (term: string): Promise<ApiResponse> => {
    if (term.length < 3) {
        return { error: 'Not enough characters to search' }
    }
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/team/search?q=${term}`,
    )
    return unwrapResponse(response)
}

export const getManagedTeam = async (
    token: string,
    id: string,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/team/managing/${id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    return unwrapResponse(response)
}

export const toggleRosterStatus = async (
    token: string,
    id: string,
    open: boolean,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/team/open/${id}?open=${open}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        },
    )

    return await unwrapResponse(response)
}

export const removePlayer = async (
    token: string,
    teamId: string,
    userId: string,
): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/team/remove/player/${teamId}?user=${userId}`,
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
