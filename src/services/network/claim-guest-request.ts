import axios from 'axios'
import { API_KEY, API_URL_V1 } from '@env'

export const createClaimGuestRequest = async (
    token: string,
    guestId: string,
    teamId: string,
) => {
    return await axios.post(
        `${API_URL_V1}/claim-guest-request`,
        {
            guestId,
            teamId,
        },
        {
            headers: {
                'X-API-Key': API_KEY,
                Authorization: `Bearer ${token}`,
            },
        },
    )
}

export const getClaimGuestRequests = async (token: string, teamId: string) => {
    return await axios.get(`${API_URL_V1}/claim-guest-request/team/${teamId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'X-API-Key': API_KEY,
        },
    })
}
