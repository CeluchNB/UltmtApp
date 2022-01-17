import { ApiResponse } from '../../types/services'
import { CreateUserData } from '../../types/user'

export const login = async (
    username: string,
    password: string,
): Promise<ApiResponse> => {
    const response = await fetch('https://ultmt-dev.herokuapp.com/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
        },
        body: JSON.stringify({
            email: username,
            password: password,
        }),
    })

    if (response.ok) {
        return { data: await response.json() }
    } else {
        throw new Error(await response.text())
    }
}

export const fetchProfile = async (token: string): Promise<ApiResponse> => {
    const response = await fetch('https://ultmt-dev.herokuapp.com/user/me', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (response.ok) {
        return { data: await response.json() }
    } else {
        throw new Error(await response.text())
    }
}

export const createAccount = async (
    profileData: CreateUserData,
): Promise<ApiResponse> => {
    console.log('making create account call')
    const response = await fetch('https://ultmt-dev.herokuapp.com/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: '*/*',
        },
        body: JSON.stringify({ ...profileData }),
    })

    if (response.ok) {
        return { data: await response.json() }
    } else {
        throw new Error(await response.text())
    }
}
