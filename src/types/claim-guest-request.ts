import { DisplayTeam } from './team'
import { DisplayUser } from './user'

export interface ClaimGuestRequest {
    _id: string
    guestId: string
    userId: string
    teamId: string
    guest: DisplayUser
    user: DisplayUser
    team: DisplayTeam
    status: string
}
