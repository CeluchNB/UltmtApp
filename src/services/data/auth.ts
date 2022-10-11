import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import EncryptedStorage from 'react-native-encrypted-storage'
import { throwApiError } from '../../utils/service-utils'
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
): Promise<string> => {
    try {
        const response = await networkLogin(username, password)

        const tokens = response.data.tokens
        const { access, refresh } = tokens
        await EncryptedStorage.setItem('access_token', access)
        await EncryptedStorage.setItem('refresh_token', refresh)
        return access
    } catch (error: any) {
        return throwApiError(error, Constants.GENERIC_LOGIN_ERROR)
    }
}

/**
 * Logout current user
 * @param token token of current user
 * @throws error if backend returns an error
 */
export const logout = async (token: string) => {
    try {
        await EncryptedStorage.removeItem('access_token')
        await networkLogout(token)
    } catch (error: any) {
        throw throwApiError(error, Constants.GENERIC_LOGOUT_ERROR)
    }
}

export const refreshToken = async (token: string) => {
    try {
        const response = await networkRefreshToken(token)
        const { tokens } = response.data
        const { access, refresh } = tokens
        await EncryptedStorage.setItem('access_token', access)
        await EncryptedStorage.setItem('refresh_token', refresh)
    } catch (error: any) {
        throw throwApiError(error, Constants.GENERIC_GET_TOKEN_ERROR)
    }
}

/**
 * Get current token from local storage
 * @returns token from local storage
 * @throws error if backend returns an error
 */
export const getAccessToken = async (): Promise<string> => {
    try {
        const token = await EncryptedStorage.getItem('access_token')
        if (!token) {
            throw new ApiError(Constants.GENERIC_GET_TOKEN_ERROR)
        }
        return token
    } catch (error) {
        throw throwApiError(error, Constants.GENERIC_GET_TOKEN_ERROR)
    }
}
