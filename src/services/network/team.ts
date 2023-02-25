import { CreateTeam } from '../../types/team'
import { API_KEY, API_URL_V1 } from '@env'
import axios, { AxiosResponse } from 'axios'

export const createTeam = async (
    token: string,
    data: CreateTeam,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/team`,
        {
            team: { ...data },
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const searchTeam = async (
    term: string,
    rosterOpen?: boolean,
): Promise<AxiosResponse> => {
    return await axios.get(
        `${API_URL_V1}/team/search?q=${term}&rosterOpen=${rosterOpen}`,
        {
            headers: { 'X-API-Key': API_KEY },
        },
    )
}

export const getManagedTeam = async (
    token: string,
    id: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/team/managing/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': API_KEY,
        },
    })
}

export const getTeam = async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/team/${id}`, {
        headers: { 'X-API-Key': API_KEY },
    })
}

export const toggleRosterStatus = async (
    token: string,
    id: string,
    open: boolean,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/team/open/${id}?open=${open}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
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
        `${API_URL_V1}/team/remove/player/${teamId}?user=${userId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
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
        `${API_URL_V1}/team/rollover/${teamId}`,
        {
            copyPlayers,
            seasonStart,
            seasonEnd,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const addManager = async (
    token: string,
    teamId: string,
    managerId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/team/${teamId}/addManager?manager=${managerId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const getArchivedTeam = async (
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/archiveTeam/${teamId}`, {
        headers: {
            'X-API-Key': API_KEY,
        },
    })
}

export const createBulkJoinCode = async (
    token: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/team/getBulkCode?id=${teamId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}
