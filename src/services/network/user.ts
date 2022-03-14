import { API_URL } from 'react-native-dotenv'
import { ApiResponse } from '../../types/services'
import { CreateUserData } from '../../types/user'
import EncryptedStorage from 'react-native-encrypted-storage'
import axios, { AxiosResponse } from 'axios'

export const login = async (
    username: string,
    password: string,
): Promise<AxiosResponse> => {
    return await axios.post(`${API_URL}/user/login`, {
        password,
        email: username,
    })
}

export const fetchProfile = async (token: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL}/user/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

export const createAccount = async (
    profileData: CreateUserData,
): Promise<AxiosResponse> => {
    return await axios.post(`${API_URL}/user`, {
        ...profileData,
    })
}

export const logout = async (token: string): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL}/user/logout`,
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
    return await axios.get(`${API_URL}/user/search?q=${term}`)
}

export const leaveTeam = async (
    token: string,
    teamId: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL}/user/leave/team?team=${teamId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )
}

export const getPublicUser = async (id: string): Promise<AxiosResponse> => {
    return await axios.get(`${API_URL}/user/${id}`)
}
