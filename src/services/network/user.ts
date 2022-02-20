import { ApiResponse } from '../../types/services'
import { CreateUserData } from '../../types/user'
import EncryptedStorage from 'react-native-encrypted-storage'
import axios, { AxiosResponse } from 'axios'

export const login = async (
    username: string,
    password: string,
): Promise<AxiosResponse> => {
    return await axios.post('https://ultmt-dev.herokuapp.com/user/login', {
        password,
        email: username,
    })
}

export const fetchProfile = async (token: string): Promise<AxiosResponse> => {
    return await axios.get('https://ultmt-dev.herokuapp.com/user/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

export const createAccount = async (
    profileData: CreateUserData,
): Promise<AxiosResponse> => {
    return await axios.post('https://ultmt-dev.herokuapp.com/user', {
        ...profileData,
    })
}

export const logout = async (token: string): Promise<AxiosResponse> => {
    return await axios.post(
        'https://ultmt-dev.herokuapp.com/user/logout',
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
    return await axios.get(
        `https://ultmt-dev.herokuapp.com/user/search?q=${term}`,
    )
}
