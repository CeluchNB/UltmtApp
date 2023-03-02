import * as LocalTeamServices from '../../../src/services/local/team'
import * as TeamServices from '../../../src/services/network/team'
import { CreateTeam, Team } from '../../../src/types/team'
import {
    addManager,
    createBulkJoinCode,
    createTeam,
    getArchivedTeam,
    getManagedTeam,
    getTeam,
    removePlayer,
    rollover,
    searchTeam,
    toggleRosterStatus,
} from '../../../src/services/data/team'

const team: Team = {
    _id: '1234',
    place: 'PGH',
    name: 'Temper',
    teamname: 'pghtemper',
    managers: [],
    players: [],
    seasonNumber: 1,
    seasonStart: '2022',
    seasonEnd: '2022',
    continuationId: '1234',
    rosterOpen: true,
    requests: [],
    games: [],
}

const createData: CreateTeam = {
    place: 'PGH',
    name: 'Temper',
    teamname: 'pghtemper',
    seasonStart: '2022',
    seasonEnd: '2022',
}

const errorText = 'Error from test'

const teamSuccess = Promise.resolve({
    data: { team },
    status: 200,
    statusText: 'Good',
    headers: {},
    config: {},
})

const teamError = Promise.reject({
    data: { message: errorText },
    status: 400,
    statusText: 'Good',
    headers: {},
    config: {},
})

describe('test team services', () => {
    it('should handle network create team success', async () => {
        jest.spyOn(LocalTeamServices, 'saveTeams').mockReturnValueOnce(
            Promise.resolve(),
        )
        jest.spyOn(TeamServices, 'createTeam').mockReturnValueOnce(teamSuccess)

        const result = await createTeam(createData)
        expect(result).toEqual(team)
    })

    it('should handle network create team failure', async () => {
        jest.spyOn(TeamServices, 'createTeam').mockReturnValueOnce(teamError)

        await expect(createTeam(createData)).rejects.toBeDefined()
    })

    it('should handle network get managed team success', async () => {
        jest.spyOn(TeamServices, 'getManagedTeam').mockReturnValueOnce(
            teamSuccess,
        )

        const result = await getManagedTeam('')
        expect(result).toEqual(team)
    })

    it('should handle network get managed team failure', async () => {
        jest.spyOn(TeamServices, 'getManagedTeam').mockReturnValueOnce(
            teamError,
        )

        await expect(getManagedTeam('')).rejects.toBeDefined()
    })

    it('should handle network get team success', async () => {
        jest.spyOn(TeamServices, 'getTeam').mockReturnValueOnce(teamSuccess)

        const result = await getTeam('')
        expect(result).toEqual(team)
    })

    it('should handle network get team failure', async () => {
        jest.spyOn(TeamServices, 'getTeam').mockReturnValueOnce(teamError)

        await expect(getTeam('')).rejects.toBeDefined()
    })

    it('should handle network remove player success', async () => {
        jest.spyOn(TeamServices, 'removePlayer').mockReturnValueOnce(
            teamSuccess,
        )

        const result = await removePlayer('', '')
        expect(result).toEqual(team)
    })

    it('should handle network remove player failure', async () => {
        jest.spyOn(TeamServices, 'removePlayer').mockReturnValueOnce(teamError)

        await expect(removePlayer('', '')).rejects.toBeDefined()
    })

    it('should handle network rollover success', async () => {
        jest.spyOn(TeamServices, 'rollover').mockReturnValueOnce(teamSuccess)

        const result = await rollover('', true, '', '')
        expect(result).toEqual(team)
    })

    it('should handle network rollover failure', async () => {
        jest.spyOn(TeamServices, 'rollover').mockReturnValueOnce(teamError)

        await expect(rollover('', true, '', '')).rejects.toBeDefined()
    })

    it('should handle search not enough characters failure', async () => {
        await expect(searchTeam('12')).rejects.toBeDefined()
    })

    it('should handle network search success', async () => {
        jest.spyOn(TeamServices, 'searchTeam').mockReturnValueOnce(
            Promise.resolve({
                data: { teams: [team, team] },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await searchTeam('1234')
        expect(result).toEqual([team, team])
    })

    it('should handle network search failure', async () => {
        jest.spyOn(TeamServices, 'searchTeam').mockReturnValueOnce(teamError)

        await expect(searchTeam('1234')).rejects.toBeDefined()
    })

    it('should handle network toggle roster status success', async () => {
        jest.spyOn(TeamServices, 'toggleRosterStatus').mockReturnValueOnce(
            teamSuccess,
        )

        const result = await toggleRosterStatus('', true)
        expect(result).toEqual(team)
    })

    it('should handle network toggle roster status failure', async () => {
        jest.spyOn(TeamServices, 'toggleRosterStatus').mockReturnValueOnce(
            teamError,
        )

        await expect(toggleRosterStatus('', true)).rejects.toBeDefined()
    })

    it('should handle network add manager success', async () => {
        jest.spyOn(TeamServices, 'addManager').mockReturnValueOnce(teamSuccess)
        const result = await addManager('', '')
        expect(result).toEqual(team)
    })

    it('should handle network add manager failure', async () => {
        jest.spyOn(TeamServices, 'toggleRosterStatus').mockReturnValueOnce(
            teamError,
        )

        await expect(addManager('', '')).rejects.toBeDefined()
    })

    it('should handle network get archived team success', async () => {
        jest.spyOn(TeamServices, 'getArchivedTeam').mockReturnValueOnce(
            teamSuccess,
        )
        const result = await getArchivedTeam('')
        expect(result).toEqual(team)
    })

    it('should handle network get archived team failure', async () => {
        jest.spyOn(TeamServices, 'getArchivedTeam').mockReturnValueOnce(
            teamError,
        )
        await expect(getArchivedTeam('')).rejects.toBeDefined()
    })

    it('should handle network create bulk join code success', async () => {
        jest.spyOn(TeamServices, 'createBulkJoinCode').mockReturnValueOnce(
            Promise.resolve({
                data: { code: '123456' },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await createBulkJoinCode('')
        expect(result).toEqual('123456')
    })

    it('should handle network create bulk join code failure', async () => {
        jest.spyOn(TeamServices, 'createBulkJoinCode').mockReturnValueOnce(
            Promise.reject({
                data: { message: 'Bad request' },
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(createBulkJoinCode('')).rejects.toBeDefined()
    })
})
