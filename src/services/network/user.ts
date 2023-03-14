import { CreateUserData } from '../../types/user'
import { API_KEY, API_URL_V1 } from '@env'
import axios, { AxiosResponse } from 'axios'

export const fetchProfile = async (token: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/user/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': API_KEY,
        },
    })
}

export const createAccount = async (
    profileData: CreateUserData,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/user`,
        {
            ...profileData,
        },
        { headers: { 'X-API-Key': API_KEY } },
    )
}

export const searchUsers = async (term: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/user/search?q=${term}`, {
        headers: { 'X-API-Key': API_KEY },
    })
}

export const leaveTeam = async (
    token: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/user/leave/team?team=${teamId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const getPublicUser = async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/user/${id}`, {
        headers: { 'X-API-Key': API_KEY },
    })
}

export const leaveManagerRole = async (
    token: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/user/managerLeave?team=${teamId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const requestPasswordRecovery = async (
    email: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/user/requestPasswordRecovery`,
        {
            email,
        },
        {
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const resetPassword = async (
    passcode: string,
    newPassword: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/user/resetPassword`,
        {
            passcode,
            newPassword,
        },
        {
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const setOpenToRequests = async (
    token: string,
    open: boolean,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/user/open?open=${open}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const changeName = async (
    token: string,
    newFirstName: string,
    newLastName: string,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/user/changeName`,
        {
            newFirstName,
            newLastName,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const setPrivate = async (
    token: string,
    privateAccount: boolean,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/user/setPrivate?private=${privateAccount}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const changeEmail = async (
    email: string,
    password: string,
    newEmail: string,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/user/changeEmail`,
        {
            email,
            password,
            newEmail,
        },
        {
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const changePassword = async (
    email: string,
    password: string,
    newPassword: string,
): Promise<AxiosResponse> => {
    return await axios.put(
        `${API_URL_V1}/user/changePassword`,
        {
            email,
            password,
            newPassword,
        },
        {
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const deleteAccount = async (token: string): Promise<AxiosResponse> => {
    return await axios.delete(`${API_URL_V1}/user/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': API_KEY,
        },
    })
}

export const joinTeamByCode = async (
    token: string,
    code: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/user/joinTeamByCode?code=${code}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}
