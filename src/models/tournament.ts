import { Realm } from '@realm/react'

export const TournamentSchema: Realm.ObjectSchema = {
    name: 'Tournament',
    embedded: true,
    properties: {
        _id: 'string',
        startDate: 'date?',
        endDate: 'date?',
        name: 'string',
        eventId: 'string',
    },
}
