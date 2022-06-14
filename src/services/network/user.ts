import { API_URL_V1 } from 'react-native-dotenv'
import { ApiResponse } from '../../types/services'
import { CreateUserData } from '../../types/user'
import EncryptedStorage from 'react-native-encrypted-storage'
import axios, { AxiosResponse } from 'axios'

export const login = async (
    username: string,
    password: string,
): Promise<AxiosResponse> => {
    return await axios.post(`${API_URL_V1}/user/login`, {
        password,
        email: username,
    })
}

export const fetchProfile = async (token: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/user/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

export const createAccount = async (
    profileData: CreateUserData,
): Promise<AxiosResponse> => {
    return await axios.post(`${API_URL_V1}/user`, {
        ...profileData,
    })
}

export const logout = async (token: string): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/user/logout`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
}

export const getLocalToken = async (): Promise<ApiResponse> => {
    try {
        const token = await EncryptedStorage.getItem('jwt_token')
        if (token) {
            return { data: token }
        }
    } catch (error) {
        throw error
    }
    throw new Error('No token available')
}

export const searchUsers = async (term: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/user/search?q=${term}`)
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
            },
        },
    )
}

export const getPublicUser = async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL_V1}/user/${id}`)
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
            },
        },
    )
}

export const requestPasswordRecovery = async (
    email: string,
): Promise<AxiosResponse> => {
    return await axios.post(`${API_URL_V1}/user/requestPasswordRecovery`, {
        email,
    })
}

export const resetPassword = async (
    passcode: string,
    newPassword: string,
): Promise<AxiosResponse> => {
    return await axios.post(`${API_URL_V1}/user/resetPassword`, {
        passcode,
        newPassword,
    })
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
            },
        },
    )
}

export const changeEmail = async (
    email: string,
    password: string,
    newEmail: string,
): Promise<AxiosResponse> => {
    return await axios.put(`${API_URL_V1}/user/changeEmail`, {
        email,
        password,
        newEmail,
    })
}
