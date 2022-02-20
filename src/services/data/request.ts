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
