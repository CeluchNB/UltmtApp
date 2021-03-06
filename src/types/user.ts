import { DisplayTeam } from './team'

export interface CreateUserData {
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
}

export interface DisplayUser {
    _id: string
    firstName: string
    lastName: string
    username: string
}

export interface User extends DisplayUser {
    email: string
    requests: string[]
    playerTeams: DisplayTeam[]
    managerTeams: DisplayTeam[]
    archiveTeams: DisplayTeam[]
    stats: string[]
    openToRequests: boolean
    private: boolean
}
