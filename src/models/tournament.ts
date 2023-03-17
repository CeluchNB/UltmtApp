import { Realm } from '@realm/react'
import { Tournament } from '../types/tournament'

export class TournamentSchema {
    static schema: Realm.ObjectSchema = {
        name: 'Tournament',
        primaryKey: '_id',
        properties: {
            _id: 'string',
            startDate: 'date?',
            endDate: 'date?',
            name: 'string',
            eventId: 'string',
        },
    }

    _id: string
    startDate?: Date
    endDate?: Date
    name: string
    eventId: string

    constructor(tournament: Tournament) {
        this._id = tournament._id
        this.startDate = tournament.startDate
            ? new Date(tournament.startDate)
            : undefined
        this.endDate = tournament.endDate
            ? new Date(tournament.endDate)
            : undefined
        this.name = tournament.name
        this.eventId = tournament.eventId
    }
}
