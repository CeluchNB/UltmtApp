import * as Constants from '../../utils/constants'
import { DetailedRequest } from '../../types/request'
import { throwApiError } from '../../utils/service-utils'
import {
    deleteTeamRequest as networkDeleteTeamRequest,
    deleteUserRequest as networkDeleteUserRequest,
    getRequest as networkGetRequest,
    requestTeam as networkRequestTeam,
    requestUser as networkRequestUser,
    respondToPlayerRequest as networkRespondToPlayerRequest,
    respondToTeamRequest as networkRespondToTeamRequest,
} from '../network/request'

/**
 * Method for user to request to join a team.
 * @param token jwt of requesting user
 * @param teamId id of requested team
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const requestTeam = async (
    token: string,
    teamId: string,
): Promise<DetailedRequest> => {
    try {
        const response = await networkRequestTeam(token, teamId)
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.CREATE_REQUEST_ERROR)
    }
}

/**
 * Method for team to request a user join a team.
 * @param token jwt of team manager
 * @param userId user to request join team
 * @param teamId team requesting the player to join
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const requestUser = async (
    token: string,
    userId: string,
    teamId: string,
): Promise<DetailedRequest> => {
    try {
        const response = await networkRequestUser(token, userId, teamId)
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.CREATE_REQUEST_ERROR)
    }
}

/**
 * Method to get request details. User must be authorized to view request.
 * User is authorized if 1) he is the user on the request or 2) he is a manager
 * of the team on the request
 * @param token jwt of current user
 * @param requestId id of request
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const getRequest = async (
    token: string,
    requestId: string,
): Promise<DetailedRequest> => {
    try {
        const response = await networkGetRequest(token, requestId)
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.GET_REQUEST_ERROR)
    }
}

/**
 * Method for team to respond to a player's request
 * @param token jwt of team manager
 * @param requestId id of request
 * @param accept boolean for accept/deny
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const respondToPlayerRequest = async (
    token: string,
    requestId: string,
    accept: boolean,
): Promise<DetailedRequest> => {
    try {
        const response = await networkRespondToPlayerRequest(
            token,
            requestId,
            accept,
        )
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.REQUEST_RESPONSE_ERROR)
    }
}

/**
 * Method for a team to delete a pending request it sent.
 * @param token jwt of team manager
 * @param requestId id of request to delete
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const deleteTeamRequest = async (
    token: string,
    requestId: string,
): Promise<DetailedRequest> => {
    try {
        const response = await networkDeleteTeamRequest(token, requestId)
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.REQUEST_RESPONSE_ERROR)
    }
}

/**
 * Method for user to respond to a request from a team
 * @param token jwt of user
 * @param requestId id of request to respond to
 * @param accept boolean for accept/deny
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const respondToTeamRequest = async (
    token: string,
    requestId: string,
    accept: boolean,
): Promise<DetailedRequest> => {
    try {
        const response = await networkRespondToTeamRequest(
            token,
            requestId,
            accept,
        )
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.REQUEST_RESPONSE_ERROR)
    }
}

/**
 * Method for a user to delete a pending request she has sent.
 * @param token jwt of user
 * @param requestId id of request to delete
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const deleteUserRequest = async (
    token: string,
    requestId: string,
): Promise<DetailedRequest> => {
    try {
        const response = await networkDeleteUserRequest(token, requestId)
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.REQUEST_RESPONSE_ERROR)
    }
}
