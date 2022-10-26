import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import { AxiosResponse } from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'
import jwt_decode from 'jwt-decode'
import { isTokenExpired, throwApiError } from '../../utils/service-utils'
import {
    login as networkLogin,
    logout as networkLogout,
    refreshToken as networkRefreshToken,
} from '../network/auth'

/**
 * Method to login
 * @param username username or email
 * @param password password
 * @returns user token
 * @throws error if backend returns an error
 */
export const login = async (
    username: string,
    password: string,
): Promise<void> => {
    try {
        const response = await networkLogin(username, password)

        const tokens = response.data.tokens
        const { access, refresh } = tokens
        await EncryptedStorage.setItem('access_token', access)
        await EncryptedStorage.setItem('refresh_token', refresh)
    } catch (error: any) {
        return throwApiError(error, Constants.GENERIC_LOGIN_ERROR)
    }
}

/**
 * Logout current user
 * @param token token of current user
 * @throws error if backend returns an error
 */
export const logout = async () => {
    try {
        await withToken(networkLogout)
        await EncryptedStorage.removeItem('access_token')
        await EncryptedStorage.removeItem('refresh_token')
    } catch (error: any) {
        await EncryptedStorage.removeItem('access_token')
        await EncryptedStorage.removeItem('refresh_token')
        throw throwApiError(error, Constants.GENERIC_LOGOUT_ERROR)
    }
}

/**
 * Method to refresh the user's authentication token
 * @returns the new access token
 */
export const refreshToken = async (): Promise<string> => {
    try {
        const token = await EncryptedStorage.getItem('refresh_token')
        if (!token) {
            throw new ApiError(Constants.GENERIC_GET_TOKEN_ERROR)
        }
        const response = await networkRefreshToken(token)
        const { tokens } = response.data
        const { access, refresh } = tokens
        await EncryptedStorage.setItem('access_token', access)
        await EncryptedStorage.setItem('refresh_token', refresh)
        return access
    } catch (error: any) {
        await EncryptedStorage.removeItem('access_token')
        await EncryptedStorage.removeItem('refresh_token')
        throw throwApiError(error, Constants.GENERIC_GET_TOKEN_ERROR)
    }
}

/**
 * Method to make an API call with an authentication token that could be expired.
 * Will make the refresh call and try again if the token is expired.
 * @param networkCall method to call
 * @param args arguments of method
 * @returns expected response of network call
 */
export const withToken = async (
    networkCall: (token: string, ...args: any[]) => Promise<AxiosResponse>,
    ...args: any[]
): Promise<AxiosResponse> => {
    try {
        const currentToken =
            (await EncryptedStorage.getItem('access_token')) || ''
        const response = await networkCall(currentToken, ...args)
        return response
    } catch (error: any) {
        if (error.status !== 401) {
            throw error
        }
        try {
            const newToken = await refreshToken()
            return await networkCall(newToken, ...args)
        } catch (error2) {
            throw throwApiError(error2, Constants.GENERIC_GET_TOKEN_ERROR)
        }
    }
}

/**
 * Get current token from local storage
 * @returns token from local storage
 * @throws error if backend returns an error
 */
export const isLoggedIn = async (): Promise<boolean> => {
    try {
        const rToken = await EncryptedStorage.getItem('refresh_token')
        if (!rToken) {
            throw new ApiError(Constants.GENERIC_GET_TOKEN_ERROR)
        }

        const { exp: rExp } = jwt_decode(rToken) as any
        if (isTokenExpired(rExp)) {
            throw new ApiError(Constants.GENERIC_GET_TOKEN_ERROR)
        }

        const accessToken = await EncryptedStorage.getItem('access_token')
        if (!accessToken) {
            throw new ApiError(Constants.GENERIC_GET_TOKEN_ERROR)
        }
        return true
    } catch (error) {
        throw throwApiError(error, Constants.GENERIC_GET_TOKEN_ERROR)
    }
}
