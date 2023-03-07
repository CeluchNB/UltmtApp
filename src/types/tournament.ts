export interface LocalTournament {
    startDate?: string
    endDate?: string
    name: string
    eventId: string
}
export interface Tournament extends LocalTournament {
    _id: string
}
