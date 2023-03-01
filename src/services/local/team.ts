import { Realm } from '@realm/react'
import { Team } from '../../types/team'
import { TeamSchema } from '../../models'
import { getRealm } from '../../models/realm'

export const saveTeams = async (teams: Team[]) => {
    const realm = await getRealm()
    realm.write(() => {
        for (const team of teams) {
            realm.create('Team', team, Realm.UpdateMode.Modified)
        }
    })
}

export const getManagingTeams = async (id: string): Promise<Team[]> => {
    const realm = await getRealm()
    const teams = await realm.objects<TeamSchema>('Team')
    return teams
        .filter(t => t.managers.map(m => m._id).includes(id))
        .map(t => parseTeam(t))
}

const parseTeam = (schema: TeamSchema): Team => {
    return JSON.parse(
        JSON.stringify({
            _id: schema._id,
            place: schema.place,
            name: schema.name,
            teamname: schema.teamname,
            managers: schema.managers,
            players: schema.players,
            seasonStart: schema.seasonStart,
            seasonEnd: schema.seasonEnd,
            seasonNumber: schema.seasonNumber,
            continuationId: schema.continuationId,
            rosterOpen: schema.rosterOpen,
            requests: [],
            games: [],
        }),
    )
}
