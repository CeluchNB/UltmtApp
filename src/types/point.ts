import { DisplayUser } from './user'
import { GuestTeam } from './team'
import { SavedServerAction } from './action'

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

export interface PopulatedPoint extends Point {
    actions: SavedServerAction[]
}

export default Point
