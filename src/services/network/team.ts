import { CreateTeam } from '../../types/team'
import axios, { AxiosResponse } from 'axios'

export const createTeam = async (
    token: string,
    data: CreateTeam,
): Promise<AxiosResponse> => {
    return await axios.post(
        'https://ultmt-dev.herokuapp.com/team',
        {
            team: { ...data },
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
}

export const searchTeam = async (term: string): Promise<AxiosResponse> => {
    return await axios.get(
        `https://ultmt-dev.herokuapp.com/team/search?q=${term}`,
    )
}

export const getManagedTeam = async (
    token: string,
    id: string,
): Promise<AxiosResponse> => {
    return await axios.get(
        `https://ultmt-dev.herokuapp.com/team/managing/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
}

export const toggleRosterStatus = async (
    token: string,
    id: string,
    open: boolean,
): Promise<AxiosResponse> => {
    return await axios.put(
        `https://ultmt-dev.herokuapp.com/team/open/${id}?open=${open}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
}

export const removePlayer = async (
    token: string,
    teamId: string,
    userId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `https://ultmt-dev.herokuapp.com/team/remove/player/${teamId}?user=${userId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
}

export const rollover = async (
    token: string,
    teamId: string,
    copyPlayers: boolean,
    seasonStart: string,
    seasonEnd: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `https://ultmt-dev.herokuapp.com/team/rollover/${teamId}`,
        {
            copyPlayers,
            seasonStart,
            seasonEnd,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
}
