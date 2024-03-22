import * as Constants from '../../../src/utils/constants'
import { ClaimGuestRequest } from '../../types/claim-guest-request'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import {
    acceptClaimGuestRequest as networkAcceptClaimGuestRequest,
    createClaimGuestRequest as networkCreateClaimGuestRequest,
    denyClaimGuestRequest as networkDenyClaimGuestRequest,
    getClaimGuestRequests as networkGetClaimGuestRequests,
} from '../network/claim-guest-request'

export const createClaimGuestRequest = async (
    guestId: string,
    teamId: string,
) => {
    try {
        await withToken(networkCreateClaimGuestRequest, guestId, teamId)
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_CLAIM_GUEST)
    }
}

export const getClaimGuestRequests = async (
    teamId: string,
): Promise<ClaimGuestRequest[]> => {
    try {
        const response = await withToken(networkGetClaimGuestRequests, teamId)
        const { requests } = response.data
        return requests
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_GET_CLAIM_GUEST_REQUESTS)
    }
}

export const acceptClaimGuestRequest = async (
    requestId: string,
): Promise<ClaimGuestRequest> => {
    try {
        const response = await withToken(
            networkAcceptClaimGuestRequest,
            requestId,
        )
        const { request } = response.data
        return request
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_UPDATE_CLAIM_GUEST_REQUEST)
    }
}

export const denyClaimGuestRequest = async (
    requestId: string,
): Promise<ClaimGuestRequest> => {
    try {
        const response = await withToken(
            networkDenyClaimGuestRequest,
            requestId,
        )
        const { request } = response.data
        return request
    } catch (e) {
        return throwApiError(e, Constants.UNABLE_TO_UPDATE_CLAIM_GUEST_REQUEST)
    }
}
