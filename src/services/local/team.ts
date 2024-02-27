import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import { Realm } from '@realm/react'
import { Team } from '../../types/team'
import { TeamSchema } from '../../models'
import { getRealm } from '../../models/realm'

export const saveTeams = async (teams: Team[], overwritePlayers = false) => {
    const realm = await getRealm()
    for (const team of teams) {
        const teamObject = await realm.objectForPrimaryKey<TeamSchema>(
            'Team',
            team._id,
        )

        if (teamObject && !overwritePlayers) {
            const players = [...teamObject.players]
            team.players.forEach(p1 =>
                players.findIndex(p2 => p1._id === p2._id) === -1
                    ? players.push(p1)
                    : null,
            )
            team.players = players.map(p => ({
                _id: p._id,
                firstName: p.firstName,
                lastName: p.lastName,
                username: p.username,
                localGuest: p.localGuest,
            }))
        }

        realm.write(() => {
            realm.create('Team', team, Realm.UpdateMode.Modified)
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
        const team = await realm.objectForPrimaryKey('Team', teamId)
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
