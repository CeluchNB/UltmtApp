import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import EncryptedStorage from 'react-native-encrypted-storage'
import { throwApiError } from '../../utils/service-utils'
import { CreateUserData, DisplayUser, User } from '../../types/user'
import {
    createAccount as networkCreateAccount,
    fetchProfile as networkFetchProfile,
    login as networkLogin,
    logout as networkLogout,
    searchUsers as networkSearchUsers,
} from '../network/user'

/**
 * Method to login
 * @param username username or email
 * @param password password
 * @returns user token
 */
export const login = async (
    username: string,
    password: string,
): Promise<string> => {
    try {
        const response = await networkLogin(username, password)

        const token = response.data.token
        await EncryptedStorage.setItem('jwt_token', token)
        return token
    } catch (error: any) {
        return throwApiError(error, Constants.GENERIC_LOGIN_ERROR)
    }
}

/**
 * Method to get a user's profile by their jwt
 * @param token jwt of the user
 * @returns a user object
 */
export const fetchProfile = async (token: string): Promise<User> => {
    try {
        const response = await networkFetchProfile(token)
        const user = response.data
        return user
    } catch (error: any) {
        return throwApiError(error, Constants.GENERIC_FETCH_PROFILE_ERROR)
    }
}

/**
 * Method to create
 * @param profileData data to create account
 * @returns user data and a jwt token
 */
export const createAccount = async (
    profileData: CreateUserData,
): Promise<{ user: User; token: string }> => {
    try {
        const response = await networkCreateAccount(profileData)
        const { user, token } = response.data
        await EncryptedStorage.setItem('jwt_token', token)
        return { user, token }
    } catch (error: any) {
        return throwApiError(error, Constants.GENERIC_CREATE_ACCOUNT_ERROR)
    }
}

/**
 * Logout current user
 * @param token token of current user
 */
export const logout = async (token: string) => {
    try {
        await networkLogout(token)
        await EncryptedStorage.removeItem('jwt_token')
    } catch (error: any) {
        throw throwApiError(error, Constants.GENERIC_LOGOUT_ERROR)
    }
}

/**
 * Get current token from local storage
 * @returns token from local storage
 */
export const getLocalToken = async (): Promise<string> => {
    try {
        const token = await EncryptedStorage.getItem('jwt_token')
        if (!token) {
            throw new ApiError(Constants.GENERIC_GET_TOKEN_ERROR)
        }
        return token
    } catch (error) {
        throw throwApiError(error, Constants.GENERIC_GET_TOKEN_ERROR)
    }
}

/**
 * Method to search for users
 * @param term search term
 * @returns list of users
 */
export const searchUsers = async (term: string): Promise<DisplayUser[]> => {
    try {
        if (term.length < 3) {
            throw new ApiError('Not enough characters to search')
        }
        const response = await networkSearchUsers(term)
        return response.data.users
    } catch (error) {
        throw throwApiError(error, Constants.SEARCH_ERROR)
    }
}
