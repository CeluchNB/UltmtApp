import { DisplayUser } from './user'
import { GuestTeam } from './team'
import { ClientActionData, SavedServerActionData } from './action'

interface Point {
    _id: string
    pointNumber: number
    teamOnePlayers: DisplayUser[]
    teamTwoPlayers: DisplayUser[]
    teamOneActivePlayers: DisplayUser[]
    teamTwoActivePlayers: DisplayUser[]
    teamOneScore: number
    teamTwoScore: number
    pullingTeam: GuestTeam
    receivingTeam: GuestTeam
    scoringTeam?: GuestTeam
    teamOneActive: boolean
    teamTwoActive: boolean
    teamOneActions: string[]
    teamTwoActions: string[]
}

export interface ClientPoint {
    pointNumber: number
    teamOnePlayers: DisplayUser[]
    teamOneActivePlayers: DisplayUser[]
    teamOneScore: number
    teamTwoScore: number
    pullingTeam: GuestTeam
    receivingTeam: GuestTeam
    scoringTeam?: GuestTeam
    actions: ClientActionData[]
}

export interface PopulatedPoint extends Point {
    actions: SavedServerActionData[]
}

export default Point
