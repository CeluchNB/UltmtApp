import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import EncryptedStorage from 'react-native-encrypted-storage'
import { throwApiError } from '../../utils/service-utils'
import { CreateUserData, DisplayUser, User } from '../../types/user'
import {
    changeEmail as networkChangeEmail,
    changeName as networkChangeName,
    changePassword as networkChangePassword,
    createAccount as networkCreateAccount,
    deleteAccount as networkDeleteAccount,
    fetchProfile as networkFetchProfile,
    getPublicUser as networkGetPublicUser,
    leaveManagerRole as networkLeaveManagerRole,
    leaveTeam as networkLeaveTeam,
    login as networkLogin,
    logout as networkLogout,
    logoutAllDevices as networkLogoutAllDevices,
    requestPasswordRecovery as networkRequestPasswordRecovery,
    resetPassword as networkResetPassword,
    searchUsers as networkSearchUsers,
    setOpenToRequests as networkSetOpenToRequests,
    setPrivate as networkSetPrivate,
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

/**
 * Method to get a user's public details. No authentication needed to make this call.
 * @param id id of user
 * @returns user object
 * @throws error if backend returns an error
 */
export const getPublicUser = async (id: string): Promise<User> => {
    try {
        const response = await networkGetPublicUser(id)
        const user = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.GENERIC_FETCH_PROFILE_ERROR)
    }
}

/**
 * Method for user to remove himself as manager of a team
 * @param token auth token of user
 * @param teamId team id to leave
 * @returns updated user
 */
export const leaveManagerRole = async (
    token: string,
    teamId: string,
): Promise<User> => {
    try {
        const response = await networkLeaveManagerRole(token, teamId)
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.EDIT_TEAM_ERROR)
    }
}

/**
 * Method for user to request a code to recover their password
 * @param email email associated with account
 * @returns void
 */
export const requestPasswordRecovery = async (email: string): Promise<void> => {
    try {
        await networkRequestPasswordRecovery(email)
    } catch (error) {
        return throwApiError(error, Constants.UNABLE_TO_EMAIL)
    }
}

/**
 * Method for user to reset their password
 * @param passcode 6 digit passcode user can redeem
 * @param newPassword new password
 * @returns new jwt and user profile
 */
export const resetPassword = async (
    passcode: string,
    newPassword: string,
): Promise<{ token: string; user: User }> => {
    try {
        const response = await networkResetPassword(passcode, newPassword)
        const { token, user } = response.data
        return { token, user }
    } catch (error) {
        return throwApiError(error, Constants.RESET_PASSWORD_ERROR)
    }
}

/**
 * Method to change user's ability to receive requests
 * @param token auth token of user
 * @param open boolean if user wishes to receive requests
 * @returns updated user profile
 */
export const setOpenToRequests = async (
    token: string,
    open: boolean,
): Promise<User> => {
    try {
        const response = await networkSetOpenToRequests(token, open)
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.TOGGLE_ROSTER_STATUS_ERROR)
    }
}

/**
 * Method to update a user's first and last name
 * @param token auth token of user
 * @param firstName first name of user
 * @param lastName last name of user
 * @returns updated user value
 */
export const changeName = async (
    token: string,
    firstName: string,
    lastName: string,
): Promise<User> => {
    try {
        const response = await networkChangeName(token, firstName, lastName)
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.EDIT_USER_ERROR)
    }
}

/**
 * Method to set a user's private status
 * @param token auth token of user
 * @param privateAccount user's private status
 * @returns updated user value
 */
export const setPrivate = async (
    token: string,
    privateAccount: boolean,
): Promise<User> => {
    try {
        const response = await networkSetPrivate(token, privateAccount)
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.EDIT_USER_ERROR)
    }
}

/**
 * Method to change a user's email
 * @param email current email to fulfill email/password login requirement
 * @param password current password
 * @param newEmail new email
 * @returns updated user value
 */
export const changeEmail = async (
    email: string,
    password: string,
    newEmail: string,
): Promise<User> => {
    try {
        const response = await networkChangeEmail(email, password, newEmail)
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.EDIT_USER_ERROR)
    }
}

/**
 * Method to change a user's password
 * @param email current email to fulfill email/password login requirement
 * @param password current password
 * @param newPassword updated password
 * @returns updated user value
 */
export const changePassword = async (
    email: string,
    password: string,
    newPassword: string,
): Promise<User> => {
    try {
        const response = await networkChangePassword(
            email,
            password,
            newPassword,
        )
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.EDIT_USER_ERROR)
    }
}

/**
 * Method to remove all user token's from the whitelist
 * @param token user's auth token
 * @returns nothing
 */
export const logoutAllDevices = async (token: string): Promise<void> => {
    try {
        await EncryptedStorage.removeItem('jwt_token')
        await networkLogoutAllDevices(token)
    } catch (error) {
        return throwApiError(error, Constants.GENERIC_LOGOUT_ERROR)
    }
}

/**
 * Method to delete a user's account
 * @param token user's auth toen
 * @returns nothing
 */
export const deleteAccount = async (token: string): Promise<void> => {
    try {
        await EncryptedStorage.removeItem('jwt_token')
        await networkDeleteAccount(token)
    } catch (error) {
        return throwApiError(error, Constants.DELETE_USER_ERROR)
    }
}
