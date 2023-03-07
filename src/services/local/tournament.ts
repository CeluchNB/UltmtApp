import { Tournament } from '../../types/tournament'
import { TournamentSchema } from '../../models'
import { getRealm } from '../../models/realm'

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
