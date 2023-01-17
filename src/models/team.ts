import { Realm } from '@realm/react'

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
