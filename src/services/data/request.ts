import * as Constants from '../../utils/constants'
import { DetailedRequest } from '../../types/request'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import {
    deleteTeamRequest as networkDeleteTeamRequest,
    deleteUserRequest as networkDeleteUserRequest,
    getRequest as networkGetRequest,
    getRequestsByTeam as networkGetRequestsByTeam,
    getRequestsByUser as networkGetRequestsByUser,
    requestTeam as networkRequestTeam,
    requestUser as networkRequestUser,
    respondToPlayerRequest as networkRespondToPlayerRequest,
    respondToTeamRequest as networkRespondToTeamRequest,
} from '../network/request'

/**
 * Method for user to request to join a team.
 * @param teamId id of requested team
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const requestTeam = async (teamId: string): Promise<DetailedRequest> => {
    try {
        const response = await withToken(networkRequestTeam, teamId)
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.CREATE_REQUEST_ERROR)
    }
}

/**
 * Method for team to request a user join a team.
 * @param userId user to request join team
 * @param teamId team requesting the player to join
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const requestUser = async (
    userId: string,
    teamId: string,
): Promise<DetailedRequest> => {
    try {
        const response = await withToken(networkRequestUser, userId, teamId)
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
 * @param requestId id of request
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const getRequest = async (
    requestId: string,
): Promise<DetailedRequest> => {
    try {
        const response = await withToken(networkGetRequest, requestId)
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.GET_REQUEST_ERROR)
    }
}

/**
 * Method for team to respond to a player's request
 * @param requestId id of request
 * @param accept boolean for accept/deny
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const respondToPlayerRequest = async (
    requestId: string,
    accept: boolean,
): Promise<DetailedRequest> => {
    try {
        const response = await withToken(
            networkRespondToPlayerRequest,
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
 * @param requestId id of request to delete
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const deleteTeamRequest = async (
    requestId: string,
): Promise<DetailedRequest> => {
    try {
        const response = await withToken(networkDeleteTeamRequest, requestId)
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.REQUEST_RESPONSE_ERROR)
    }
}

/**
 * Method for user to respond to a request from a team
 * @param requestId id of request to respond to
 * @param accept boolean for accept/deny
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const respondToTeamRequest = async (
    requestId: string,
    accept: boolean,
): Promise<DetailedRequest> => {
    try {
        const response = await withToken(
            networkRespondToTeamRequest,
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
 * @param requestId id of request to delete
 * @returns a detailed request object
 * @throws error if backend returns an error
 */
export const deleteUserRequest = async (
    requestId: string,
): Promise<DetailedRequest> => {
    try {
        const response = await withToken(networkDeleteUserRequest, requestId)
        const { request } = response.data
        return request
    } catch (error) {
        return throwApiError(error, Constants.REQUEST_RESPONSE_ERROR)
    }
}

/**
 * Get all requests belonging to a team=
 * @param teamId id of team to get requests from
 * @returns list of detailed requests
 */
export const getRequestsByTeam = async (
    teamId: string,
): Promise<DetailedRequest[]> => {
    try {
        const response = await withToken(networkGetRequestsByTeam, teamId)
        const { requests } = response.data
        return requests
    } catch (error) {
        return throwApiError(error, Constants.REQUEST_RESPONSE_ERROR)
    }
}

/**
 * Get all requests beloinging to a user
 * @returns list of detailed requests
 */
export const getRequestsByUser = async (): Promise<DetailedRequest[]> => {
    try {
        const response = await withToken(networkGetRequestsByUser)
        const { requests } = response.data
        return requests
    } catch (error) {
        return throwApiError(error, Constants.REQUEST_RESPONSE_ERROR)
    }
}
