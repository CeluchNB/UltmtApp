import { GuestTeam } from './team'
import { GuestUser } from './user'

interface Point {
    _id: string
    pointNumber: number
    teamOnePlayers: GuestUser[]
    teamTwoPlayers: GuestUser[]
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

export default Point