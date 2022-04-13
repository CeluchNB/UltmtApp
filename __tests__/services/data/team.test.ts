import * as TeamServices from '../../../src/services/network/team'
import { CreateTeam, Team } from '../../../src/types/team'
import {
    addManager,
    createTeam,
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
        jest.spyOn(TeamServices, 'createTeam').mockReturnValueOnce(teamSuccess)

        const result = await createTeam('', createData)
        expect(result).toEqual(team)
    })

    it('should handle network create team failure', async () => {
        jest.spyOn(TeamServices, 'createTeam').mockReturnValueOnce(teamError)

        expect(createTeam('', createData)).rejects.toThrow()
    })

    it('should handle network get managed team success', async () => {
        jest.spyOn(TeamServices, 'getManagedTeam').mockReturnValueOnce(
            teamSuccess,
        )

        const result = await getManagedTeam('', '')
        expect(result).toEqual(team)
    })

    it('should handle network get managed team failure', async () => {
        jest.spyOn(TeamServices, 'getManagedTeam').mockReturnValueOnce(
            teamError,
        )

        expect(getManagedTeam('', '')).rejects.toThrow()
    })

    it('should handle network get team success', async () => {
        jest.spyOn(TeamServices, 'getTeam').mockReturnValueOnce(teamSuccess)

        const result = await getTeam('')
        expect(result).toEqual(team)
    })

    it('should handle network get team failure', async () => {
        jest.spyOn(TeamServices, 'getTeam').mockReturnValueOnce(teamError)

        expect(getTeam('')).rejects.toThrow()
    })

    it('should handle network remove player success', async () => {
        jest.spyOn(TeamServices, 'removePlayer').mockReturnValueOnce(
            teamSuccess,
        )

        const result = await removePlayer('', '', '')
        expect(result).toEqual(team)
    })

    it('should handle network remove player failure', async () => {
        jest.spyOn(TeamServices, 'removePlayer').mockReturnValueOnce(teamError)

        expect(removePlayer('', '', '')).rejects.toThrow()
    })

    it('should handle network rollover success', async () => {
        jest.spyOn(TeamServices, 'rollover').mockReturnValueOnce(teamSuccess)

        const result = await rollover('', '', true, '', '')
        expect(result).toEqual(team)
    })

    it('should handle network rollover failure', async () => {
        jest.spyOn(TeamServices, 'rollover').mockReturnValueOnce(teamError)

        expect(rollover('', '', true, '', '')).rejects.toThrow()
    })

    it('should handle search not enough characters failure', async () => {
        jest.spyOn(TeamServices, 'searchTeam').mockReturnValueOnce(
            Promise.resolve({
                data: [team, team],
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        expect(searchTeam('12')).rejects.toThrow()
    })

    it('should handle network search success', async () => {
        jest.spyOn(TeamServices, 'searchTeam').mockReturnValueOnce(
            Promise.resolve({
                data: [team, team],
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

        expect(searchTeam('1234')).rejects.toThrow()
    })

    it('should handle network toggle roster status success', async () => {
        jest.spyOn(TeamServices, 'toggleRosterStatus').mockReturnValueOnce(
            teamSuccess,
        )

        const result = await toggleRosterStatus('', '', true)
        expect(result).toEqual(team)
    })

    it('should handle network toggle roster status failure', async () => {
        jest.spyOn(TeamServices, 'toggleRosterStatus').mockReturnValueOnce(
            teamError,
        )

        expect(toggleRosterStatus('', '', true)).rejects.toThrow()
    })

    it('should handle network add manager success', async () => {
        jest.spyOn(TeamServices, 'addManager').mockReturnValueOnce(teamSuccess)
        const result = await addManager('', '', '')
        expect(result).toEqual(team)
    })

    it('should handle network add manager failure', async () => {
        jest.spyOn(TeamServices, 'toggleRosterStatus').mockReturnValueOnce(
            teamError,
        )

        expect(addManager('', '', '')).rejects.toThrow()
    })
})
