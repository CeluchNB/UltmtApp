import { ApiResponse } from '../../types/services'
import { CreateUserData } from '../../types/user'
import EncryptedStorage from 'react-native-encrypted-storage'
import axios from 'axios'
import { unwrapResponse } from '../../utils/service-utils'

export const login = async (
    username: string,
    password: string,
): Promise<ApiResponse> => {
    return await axios.post('https://ultmt-dev.herokuapp.com/user/login', {
        password,
        email: username,
    })
}

export const fetchProfile = async (token: string): Promise<ApiResponse> => {
    return await axios.get('https://ultmt-dev.herokuapp.com/user/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
}

export const createAccount = async (
    profileData: CreateUserData,
): Promise<ApiResponse> => {
    const response = await fetch('https://ultmt-dev.herokuapp.com/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
        },
        body: JSON.stringify({ ...profileData }),
    })

    if (response.ok) {
        const data = await response.json()
        if (data.token) {
            try {
                await EncryptedStorage.setItem('jwt_token', data.token)
            } catch (error) {
                throw error
            }
        }
        return { data }
    } else {
        throw new Error(await response.text())
    }
}

export const logout = async (token: string): Promise<ApiResponse> => {
    const response = await fetch(
        'https://ultmt-dev.herokuapp.com/user/logout',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    )

    if (response.ok) {
        await EncryptedStorage.removeItem('jwt_token')
        return {}
    } else {
        throw new Error(await response.text())
    }
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

export const searchUsers = async (term: string): Promise<ApiResponse> => {
    const response = await fetch(
        `https://ultmt-dev.herokuapp.com/user/search?q=${term}`,
    )
    return await unwrapResponse(response)
}
