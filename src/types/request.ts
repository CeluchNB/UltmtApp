import { DisplayTeam } from './team'
import { DisplayUser } from './user'

export interface DetailedRequest {
    _id: string
    team: string
    user: string
    requestSource: string
    status: string
    teamDetails: DisplayTeam
    userDetails: DisplayUser
}
