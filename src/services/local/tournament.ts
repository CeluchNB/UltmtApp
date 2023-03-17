import * as Constants from '../../utils/constants'
import { Realm } from '@realm/react'
import { TournamentSchema } from '../../models'
import { getRealm } from '../../models/realm'
import { throwApiError } from '../../utils/service-utils'
import { LocalTournament, Tournament } from '../../types/tournament'

export const saveTournaments = async (tournaments: Tournament[]) => {
    const realm = await getRealm()
    realm.write(() => {
        for (const tournament of tournaments) {
            realm.create(
                'Tournament',
                new TournamentSchema(tournament),
                Realm.UpdateMode.Modified,
            )
        }
    })
}

export const getTournaments = async (q: string): Promise<Tournament[]> => {
    const realm = await getRealm()
    const tournaments = realm
        .objects<TournamentSchema>('Tournament')
        .filtered(`name CONTAINS[c] '${q}' OR eventId CONTAINS[c] '${q}'`)

    return tournaments.map(t => parseTournament(t))
}

export const getTournamentById = async (id: string): Promise<Tournament> => {
    const realm = await getRealm()
    const tournament = realm.objectForPrimaryKey<TournamentSchema>(
        'Tournament',
        id,
    )
    if (!tournament) {
        return throwApiError('', Constants.GET_TOURNAMENT_ERROR)
    }
    return parseTournament(tournament)
}

export const createTournament = async (
    data: LocalTournament & { _id?: string },
): Promise<string> => {
    const realm = await getRealm()
    const tournamentId = data._id
        ? data._id
        : new Realm.BSON.ObjectID().toHexString()
    realm.write(() => {
        realm.create(
            'Tournament',
            new TournamentSchema({
                _id: tournamentId,
                ...data,
            }),
        )
    })
    return tournamentId
}

const parseTournament = (tournament: TournamentSchema): Tournament => {
    return JSON.parse(
        JSON.stringify({
            _id: tournament._id,
            startDate: tournament.startDate?.toString(),
            endDate: tournament.endDate?.toString(),
            name: tournament.name,
            eventId: tournament.eventId,
        }),
    )
}
