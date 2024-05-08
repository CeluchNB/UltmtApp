import { DisplayUser } from './user'
import { GuestTeam } from './team'
import { ClientActionData, SavedServerActionData } from './action'

export enum PointStatus {
    FUTURE = 'future',
    ACTIVE = 'active',
    COMPLETE = 'complete',
}

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
    gameId: string
    teamOneStatus: PointStatus
    teamTwoStatus: PointStatus
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

export enum LocalPointEvents {
    ACTION_EMIT = 'action',
    UNDO_EMIT = 'action:undo',
    NEXT_POINT_EMIT = 'point:next',
    COMMENT_EMIT = 'action:comment',
    DELETE_COMMENT_EMIT = 'action:comment:delete',
    ACTION_LISTEN = 'action:client:local',
    UNDO_LISTEN = 'action:undo:client:local',
    ERROR_LISTEN = 'action:error:local',
    NEXT_POINT_LISTEN = 'point:next:client:local',
}

export enum NetworkPointEvents {
    ACTION_EMIT = 'action',
    UNDO_EMIT = 'action:undo',
    NEXT_POINT_EMIT = 'point:next',
    COMMENT_EMIT = 'action:comment',
    DELETE_COMMENT_EMIT = 'action:comment:delete',
    JOIN_POINT_EMIT = 'join:point',
    ACTION_LISTEN = 'action:client',
    UNDO_LISTEN = 'action:undo:client',
    ERROR_LISTEN = 'action:error',
    NEXT_POINT_LISTEN = 'point:next:client',
}

export default Point
