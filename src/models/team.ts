import { DisplayUser } from '../types/user'
import { Realm } from '@realm/react'
import { LocalUser, Team } from '../types/team'

export const DisplayTeamSchema: Realm.ObjectSchema = {
    name: 'DisplayTeam',
    embedded: true,
    properties: {
        _id: 'string',
        place: 'string',
        name: 'string',
        teamname: 'string',
        seasonStart: 'string',
        seasonEnd: 'string',
    },
}

export const GuestTeamSchema: Realm.ObjectSchema = {
    name: 'GuestTeam',
    embedded: true,
    properties: {
        _id: 'string?',
        place: 'string?',
        name: 'string',
        teamname: 'string?',
        seasonStart: 'string?',
        seasonEnd: 'string?',
    },
}

export class TeamSchema {
    static schema: Realm.ObjectSchema = {
        name: 'Team',
        primaryKey: '_id',
        properties: {
            _id: 'string',
            place: 'string',
            name: 'string',
            teamname: 'string',
            managers: { type: 'list', objectType: 'DisplayUser' },
            players: { type: 'list', objectType: 'DisplayUser' },
            seasonStart: 'string',
            seasonEnd: 'string',
            seasonNumber: 'int',
            continuationId: 'string',
            rosterOpen: 'bool',
        },
    }

    _id: string
    place: string
    name: string
    teamname: string
    managers: DisplayUser[]
    players: LocalUser[]
    seasonStart: string
    seasonEnd: string
    seasonNumber: number
    continuationId: string
    rosterOpen: boolean

    constructor(team: Team) {
        this._id = team._id
        this.place = team.place
        this.name = team.name
        this.teamname = team.teamname
        this.managers = team.managers
        this.players = team.players
        this.seasonStart = team.seasonStart
        this.seasonEnd = team.seasonEnd
        this.seasonNumber = team.seasonNumber
        this.continuationId = team.continuationId
        this.rosterOpen = team.rosterOpen
    }
}
