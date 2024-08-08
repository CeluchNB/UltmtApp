import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import { Team } from '../../types/team'
import { TeamSchema } from '../../models'
import { UpdateMode } from 'realm'
import { getRealm } from '../../models/realm'
import { parseUser } from '../../utils/player'

export const saveTeams = async (teams: Team[], overwritePlayers = false) => {
    const realm = await getRealm()
    for (const team of teams) {
        const teamObject = realm.objectForPrimaryKey<TeamSchema>(
            'Team',
            team._id,
        )

        // default behavior is to only keep players from network responses and local guests
        const players = [...team.players]
        if (teamObject && !overwritePlayers) {
            players.push(
                ...teamObject.players
                    .filter(p => p.localGuest)
                    .map(p => ({ ...parseUser(p), localGuest: true })), // parse user crucial for functionality
            )
        }

        const schema = new TeamSchema({ ...team, players })
        realm.write(() => {
            realm.create('Team', schema, UpdateMode.All)
        })
    }
}

export const getTeamsByManager = async (managerId: string): Promise<Team[]> => {
    const realm = await getRealm()
    const teams = await realm.objects<TeamSchema>('Team')
    return teams
        .filter(t => t.managers.map(m => m._id).includes(managerId))
        .map(t => parseTeam(t))
}

export const getTeamById = async (id: string): Promise<Team> => {
    const realm = await getRealm()
    const team = await realm.objectForPrimaryKey<TeamSchema>('Team', id)

    if (!team) {
        throw new ApiError(Constants.GET_TEAM_ERROR)
    }

    return parseTeam(team)
}

export const deleteTeamById = async (teamId: string) => {
    try {
        const realm = await getRealm()
        const team = realm.objectForPrimaryKey('Team', teamId)
        if (!team) return

        realm.write(() => {
            realm.delete(team)
        })
    } catch (e) {
        // do nothing
    }
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
