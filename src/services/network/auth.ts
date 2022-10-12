import { API_KEY, API_URL_V1 } from 'react-native-dotenv'
import axios, { AxiosResponse } from 'axios'

export const login = async (
    username: string,
    password: string,
): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/auth/login`,
        {
            password,
            email: username,
        },
        {
            headers: {
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const logout = async (token: string): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/auth/logout`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}

export const refreshToken = async (token: string): Promise<AxiosResponse> => {
    return await axios.post(
        `${API_URL_V1}/auth/refresh`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-API-Key': API_KEY,
            },
        },
    )
}
