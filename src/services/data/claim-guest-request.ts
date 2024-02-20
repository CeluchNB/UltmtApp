import * as Constants from '../../../src/utils/constants'
import { createClaimGuestRequest as networkCreateClaimGuestRequest } from '../network/claim-guest-request'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'

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
