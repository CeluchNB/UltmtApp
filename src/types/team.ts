import { DisplayUser } from './user'

export interface DisplayTeam {
    _id: string
    place: string
    name: string
    seasonStart: string
    seasonEnd: string
}

export interface CreateTeam {
    place: string
    name: string
    seasonStart: string
    seasonEnd: string
}

export interface Team extends DisplayTeam {
    managers: DisplayUser[]
    players: DisplayUser[]
    seasonNumber: number
    continuationId: string
    rosterOpen: boolean
    requests: string[]
    games: string[]
}
