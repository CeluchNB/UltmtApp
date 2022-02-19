import * as Constants from '../../utils/constants'
import EncryptedStorage from 'react-native-encrypted-storage'
import { IUser } from '../../types/user'
import { throwApiError } from '../../utils/service-utils'
import {
    fetchProfile as networkFetchProfile,
    login as networkLogin,
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
        return throwApiError(error, Constants.GENERIC_LOGIN_FAILURE)
    }
}

export const fetchProfile = async (token: string): Promise<IUser> => {
    try {
        const response = await networkFetchProfile(token)
        const user = response.data
        return user
    } catch (error) {
        return throwApiError(error, Constants.GENERIC_FETCH_PROFILE_ERROR)
    }
}
