import { DisplayUser } from './user'
import { GuestTeam } from './team'
import { ClientAction, SavedServerAction } from './action'

interface Point {
    _id: string
    pointNumber: number
    teamOnePlayers: DisplayUser[]
    teamTwoPlayers: DisplayUser[]
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
    teamOneScore: number
    teamTwoScore: number
    pullingTeam: GuestTeam
    receivingTeam: GuestTeam
    scoringTeam?: GuestTeam
    actions: ClientAction[]
}

export interface PopulatedPoint extends Point {
    actions: SavedServerAction[]
}

export default Point
