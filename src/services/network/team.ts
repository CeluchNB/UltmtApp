import { API_URL } from 'react-native-dotenv'
import { CreateTeam } from '../../types/team'
import axios, { AxiosResponse } from 'axios'

export const createTeam = async (
    token: string,
    data: CreateTeam,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL}/team`,
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
    return await axios.get(`${API_URL}/team/search?q=${term}`)
}

export const getManagedTeam = async (
    token: string,
    id: string,
): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL}/team/managing/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

export const getTeam = async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL}/team/${id}`)
}

export const toggleRosterStatus = async (
    token: string,
    id: string,
    open: boolean,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL}/team/open/${id}?open=${open}`,
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
        `${API_URL}/team/remove/player/${teamId}?user=${userId}`,
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
        `${API_URL}/team/rollover/${teamId}`,
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
