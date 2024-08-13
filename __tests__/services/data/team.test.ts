import * as GameServices from '../../../src/services/network/game'
import * as LocalGameServices from '../../../src/services/local/game'
import * as LocalTeamServices from '../../../src/services/local/team'
import * as TeamServices from '../../../src/services/network/team'
import { AxiosResponse } from 'axios'
import { CreateTeam, Team } from '../../../src/types/team'
import {
    addManager,
    archiveTeam,
    createBulkJoinCode,
    createGuest,
    createTeam,
    deleteTeam,
    getArchivedTeam,
    getManagedTeam,
    getTeam,
    getTeamsByContinutationId,
    removePlayer,
    rollover,
    searchTeam,
    teamnameIsTaken,
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
} as AxiosResponse)

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
        jest.spyOn(LocalTeamServices, 'saveTeams').mockReturnValueOnce(
            Promise.resolve(),
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
        jest.spyOn(LocalTeamServices, 'saveTeams').mockReturnValueOnce(
            Promise.resolve(),
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
        jest.spyOn(LocalTeamServices, 'saveTeams').mockReturnValueOnce(
            Promise.resolve(),
        )

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
            } as AxiosResponse),
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
        jest.spyOn(TeamServices, 'toggleRosterStatus').mockRejectedValueOnce({
            data: { message: errorText },
            status: 400,
            statusText: 'Good',
            headers: {},
            config: {},
        })

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
            } as AxiosResponse),
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

    it('should handle delete team success', async () => {
        jest.spyOn(TeamServices, 'deleteTeam').mockReturnValueOnce(
            Promise.resolve({
                data: {},
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            } as AxiosResponse),
        )
        jest.spyOn(LocalTeamServices, 'deleteTeamById').mockReturnValueOnce(
            Promise.resolve(),
        )

        await expect(deleteTeam('')).resolves.toBeUndefined()
    })

    it('should handle delete team failure', async () => {
        jest.spyOn(TeamServices, 'deleteTeam').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(deleteTeam('')).rejects.toBeDefined()
    })

    it('handles archive team success', async () => {
        jest.spyOn(TeamServices, 'archiveTeam').mockReturnValueOnce(
            Promise.resolve({
                data: {},
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            } as AxiosResponse),
        )

        await expect(archiveTeam('')).resolves.toBeUndefined()
    })

    it('handles archive team failure', async () => {
        jest.spyOn(TeamServices, 'archiveTeam').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                config: {},
                headers: {},
            } as AxiosResponse),
        )

        await expect(archiveTeam('')).rejects.toBeDefined()
    })

    it('handles teamname is taken success', async () => {
        jest.spyOn(TeamServices, 'teamnameIsTaken').mockReturnValueOnce(
            Promise.resolve({
                data: { taken: true },
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            } as AxiosResponse),
        )

        const result = await teamnameIsTaken('test')
        expect(result).toBe(true)
    })

    it('handles teamname is taken failure', async () => {
        jest.spyOn(TeamServices, 'teamnameIsTaken').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                config: {},
                headers: {},
            } as AxiosResponse),
        )

        await expect(teamnameIsTaken('test')).rejects.toBeDefined()
    })

    describe('creates guest', () => {
        it('handles network create guest scenario', async () => {
            jest.spyOn(
                LocalGameServices,
                'isActiveGameOffline',
            ).mockReturnValue(Promise.resolve(false))
            jest.spyOn(TeamServices, 'createGuest').mockReturnValue(
                Promise.resolve(teamSuccess),
            )
            jest.spyOn(LocalTeamServices, 'saveTeams').mockReturnValue(
                Promise.resolve(),
            )
            jest.spyOn(GameServices, 'updateGamePlayers').mockReturnValue(
                Promise.resolve({
                    data: {},
                } as AxiosResponse),
            )
            jest.spyOn(LocalTeamServices, 'getTeamById').mockReturnValue(
                Promise.resolve(team),
            )
            const result = await createGuest('', '', '')
            expect(result).toMatchObject(team)
        })

        it('handles offline create guest scenario', async () => {
            jest.spyOn(
                LocalGameServices,
                'isActiveGameOffline',
            ).mockReturnValue(Promise.resolve(true))
            jest.spyOn(LocalTeamServices, 'saveTeams').mockReturnValue(
                Promise.resolve(),
            )
            jest.spyOn(LocalTeamServices, 'getTeamById').mockReturnValue(
                Promise.resolve(team),
            )
            const result = await createGuest('', '', '')
            expect(result).toMatchObject(team)
        })

        it('handles create guest failure', async () => {
            jest.spyOn(
                LocalGameServices,
                'isActiveGameOffline',
            ).mockReturnValue(Promise.resolve(false))
            jest.spyOn(TeamServices, 'createGuest').mockReturnValueOnce(
                teamError,
            )
            await expect(createGuest('', '', '')).rejects.toBeDefined()
        })
    })

    describe('gets teams by continuation id', () => {
        it('handle network success', async () => {
            jest.spyOn(
                TeamServices,
                'getTeamsByContinutationId',
            ).mockReturnValueOnce(
                Promise.resolve({
                    data: { teams: [team] },
                    status: 200,
                    statusText: 'Good',
                    headers: {},
                    config: {},
                } as AxiosResponse),
            )

            await expect(
                getTeamsByContinutationId(team._id),
            ).resolves.toMatchObject([team])
        })

        it('handles network failure', async () => {
            jest.spyOn(
                TeamServices,
                'getTeamsByContinutationId',
            ).mockReturnValueOnce(
                Promise.resolve({
                    data: { message: 'test error' },
                    status: 400,
                    statusText: 'Bad',
                    headers: {},
                    config: {},
                } as AxiosResponse),
            )

            await expect(
                getTeamsByContinutationId(team._id),
            ).rejects.toMatchObject({ message: 'test error' })
        })
    })
})
