import { API_URL_V1 } from 'react-native-dotenv'
import { CreateTeam } from '../../types/team'
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
            },
        },
    )
}

export const searchTeam = async (term: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/team/search?q=${term}`)
}

export const getManagedTeam = async (
    token: string,
    id: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/team/managing/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

export const getTeam = async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/team/${id}`)
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
            },
        },
    )
}

export const getArchivedTeam = async (
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/archiveTeam/${teamId}`)
}
