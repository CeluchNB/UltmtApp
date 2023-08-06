import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import EncryptedStorage from 'react-native-encrypted-storage'
import jwt_decode from 'jwt-decode'
import { saveTeams as localSaveTeams } from '../local/team'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import { CreateUserData, DisplayUser, User } from '../../types/user'
import {
    changeEmail as networkChangeEmail,
    changeName as networkChangeName,
    changePassword as networkChangePassword,
    createAccount as networkCreateAccount,
    deleteAccount as networkDeleteAccount,
    fetchProfile as networkFetchProfile,
    getPublicUser as networkGetPublicUser,
    joinTeamByCode as networkJoinTeamByCode,
    leaveManagerRole as networkLeaveManagerRole,
    leaveTeam as networkLeaveTeam,
    requestPasswordRecovery as networkRequestPasswordRecovery,
    resetPassword as networkResetPassword,
    searchUsers as networkSearchUsers,
    setOpenToRequests as networkSetOpenToRequests,
    setPrivate as networkSetPrivate,
} from '../network/user'

/**
 * Method to get a user's profile by their jwt
 * @returns a user object
 * @throws error if backend returns an error
 */
export const fetchProfile = async (): Promise<User> => {
    try {
        console.log('calling fetch profile')
        const response = await withToken(networkFetchProfile)
        const { user, fullManagerTeams } = response.data
        await localSaveTeams(fullManagerTeams)
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
): Promise<{ user: User }> => {
    try {
        const response = await networkCreateAccount(profileData)
        const { user, tokens } = response.data
        const { access, refresh } = tokens
        await EncryptedStorage.setItem('access_token', access)
        await EncryptedStorage.setItem('refresh_token', refresh)
        return { user }
    } catch (error: any) {
        return throwApiError(error, Constants.GENERIC_CREATE_ACCOUNT_ERROR)
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
 * @param teamId id of team to leave
 * @returns updated user profile
 * @throws error if backend returns an error
 */
export const leaveTeam = async (teamId: string): Promise<User> => {
    try {
        const response = await withToken(networkLeaveTeam, teamId)
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
 * @param teamId team id to leave
 * @returns updated user
 */
export const leaveManagerRole = async (teamId: string): Promise<User> => {
    try {
        const response = await withToken(networkLeaveManagerRole, teamId)
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
): Promise<{ user: User }> => {
    try {
        const response = await networkResetPassword(passcode, newPassword)
        const { tokens, user } = response.data
        const { access, refresh } = tokens
        await EncryptedStorage.setItem('access_token', access)
        await EncryptedStorage.setItem('refresh_token', refresh)
        return { user }
    } catch (error) {
        return throwApiError(error, Constants.RESET_PASSWORD_ERROR)
    }
}

/**
 * Method to change user's ability to receive requests
 * @param open boolean if user wishes to receive requests
 * @returns updated user profile
 */
export const setOpenToRequests = async (open: boolean): Promise<User> => {
    try {
        const response = await withToken(networkSetOpenToRequests, open)
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.TOGGLE_ROSTER_STATUS_ERROR)
    }
}

/**
 * Method to update a user's first and last name
 * @param firstName first name of user
 * @param lastName last name of user
 * @returns updated user value
 */
export const changeName = async (
    firstName: string,
    lastName: string,
): Promise<User> => {
    try {
        const response = await withToken(networkChangeName, firstName, lastName)
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.EDIT_USER_ERROR)
    }
}

/**
 * Method to set a user's private status
 * @param privateAccount user's private status
 * @returns updated user value
 */
export const setPrivate = async (privateAccount: boolean): Promise<User> => {
    try {
        const response = await withToken(networkSetPrivate, privateAccount)
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
        const {
            user,
            tokens: { access, refresh },
        } = response.data
        await EncryptedStorage.setItem('access_token', access)
        await EncryptedStorage.setItem('refresh_token', refresh)
        return user
    } catch (error) {
        return throwApiError(error, Constants.EDIT_USER_ERROR)
    }
}

/**
 * Method to delete a user's account
 * @returns nothing
 */
export const deleteAccount = async (): Promise<void> => {
    try {
        await withToken(networkDeleteAccount)
        await EncryptedStorage.removeItem('access_token')
        await EncryptedStorage.removeItem('refresh_token')
    } catch (error) {
        await EncryptedStorage.removeItem('access_token')
        await EncryptedStorage.removeItem('refresh_token')
        return throwApiError(error, Constants.DELETE_USER_ERROR)
    }
}

/**
 * Method to join a team by a 6 digit bulk code
 * @param code 6 digit bulk team join code
 * @returns updated user profile
 */
export const joinTeamByCode = async (code: string): Promise<User> => {
    try {
        const response = await withToken(networkJoinTeamByCode, code)
        const { user } = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.EDIT_USER_ERROR)
    }
}

/**
 * Method to get the current user's id based on the current token
 * @returns user's id of empty string
 */
export const getUserId = async (): Promise<string> => {
    const token = await EncryptedStorage.getItem('access_token')
    if (!token) {
        return ''
    }
    const decoded = jwt_decode(token) as any
    return decoded.sub
}
