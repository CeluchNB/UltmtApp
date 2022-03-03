import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import EncryptedStorage from 'react-native-encrypted-storage'
import { throwApiError } from '../../utils/service-utils'
import { CreateUserData, DisplayUser, User } from '../../types/user'
import {
    createAccount as networkCreateAccount,
    fetchProfile as networkFetchProfile,
    getPublicUser as networkGetPublicUser,
    leaveTeam as networkLeaveTeam,
    login as networkLogin,
    logout as networkLogout,
    searchUsers as networkSearchUsers,
} from '../network/user'

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
 * @throws error if backend returns an error
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
 * @throws error if backend returns an error
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
 * @throws error if backend returns an error
 */
export const logout = async (token: string) => {
    try {
        await EncryptedStorage.removeItem('jwt_token')
        await networkLogout(token)
    } catch (error: any) {
        throw throwApiError(error, Constants.GENERIC_LOGOUT_ERROR)
    }
}

/**
 * Get current token from local storage
 * @returns token from local storage
 * @throws error if backend returns an error
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
 * @throws error if backend returns an error
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

/**
 * Method for user to leave team
 * @param token jwt of current user
 * @param teamId id of team to leave
 * @returns updated user profile
 * @throws error if backend returns an error
 */
export const leaveTeam = async (
    token: string,
    teamId: string,
): Promise<User> => {
    try {
        const response = await networkLeaveTeam(token, teamId)
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.LEAVE_TEAM_ERROR)
    }
}

export const getPublicUser = async (id: string): Promise<User> => {
    try {
        const response = await networkGetPublicUser(id)
        const user = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.GENERIC_FETCH_PROFILE_ERROR)
    }
}
