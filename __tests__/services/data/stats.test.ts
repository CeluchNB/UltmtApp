import * as Constants from '../../../src/utils/constants'
import * as StatsNetwork from '../../../src/services/network/stats'
import { ApiError } from '../../../src/types/services'
import { AxiosResponse } from 'axios'
import { DisplayUser } from '../../../src/types/user'
import { getInitialPlayerData } from '../../../fixtures/utils'
import { teamOne } from '../../../fixtures/data'
import { GameStats, TeamStats } from '../../../src/types/stats'
import {
    filterPlayerStats,
    getGameStats,
    getGameStatsByTeam,
    getPlayerStats,
    getTeamStats,
} from '../../../src/services/data/stats'

const playerOne: DisplayUser = {
    _id: 'player1',
    firstName: 'First',
    lastName: 'Last',
    username: 'firstlast',
}

describe('getPlayerStats', () => {
    it('with valid response', async () => {
        const stats = getInitialPlayerData({
            goals: 1,
            assists: 1,
            touches: 4,
            catches: 3,
        })
        jest.spyOn(StatsNetwork, 'getPlayerStats').mockReturnValueOnce(
            Promise.resolve({
                data: { player: stats },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            } as AxiosResponse),
        )

        const result = await getPlayerStats('user1')
        expect(result).toMatchObject(stats)
    })

    it('with error', async () => {
        jest.spyOn(StatsNetwork, 'getPlayerStats').mockReturnValueOnce(
            Promise.reject({
                data: { message: Constants.UNABLE_TO_GET_PLAYER_STATS },
                status: 404,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )
        await expect(getPlayerStats('user1')).rejects.toMatchObject(
            new ApiError(Constants.UNABLE_TO_GET_PLAYER_STATS),
        )
    })
})

describe('filterPlayerStats', () => {
    it('with network result', async () => {
        const stats1 = getInitialPlayerData({
            goals: 1,
            assists: 1,
            blocks: 1,
            wins: 1,
        })

        const stats2 = getInitialPlayerData({
            goals: 2,
            throwaways: 1,
            completedPasses: 10,
            losses: 1,
        })
        jest.spyOn(StatsNetwork, 'filterPlayerStats').mockResolvedValueOnce({
            data: {
                stats: [stats1, stats2],
            },
            headers: {},
            config: {},
            status: 200,
            statusText: 'Good',
        } as AxiosResponse)

        const result = await filterPlayerStats('id', [], [])
        expect(result).toMatchObject({
            goals: 3,
            assists: 1,
            blocks: 1,
            wins: 1,
            losses: 1,
            completedPasses: 10,
            throwaways: 1,
            winPercentage: 0.5,
            plusMinus: 4,
        })
    })

    it('with blank network result', async () => {
        jest.spyOn(StatsNetwork, 'filterPlayerStats').mockResolvedValueOnce({
            data: {
                stats: [],
            },
            headers: {},
            config: {},
            status: 200,
            statusText: 'Good',
        } as AxiosResponse)
        const result = await filterPlayerStats('id', [], [])
        expect(result).toMatchObject(getInitialPlayerData({}))
    })

    it('with network error', async () => {
        jest.spyOn(StatsNetwork, 'filterPlayerStats').mockRejectedValue({
            data: {
                error: { message: 'test error' },
            },
            headers: {},
            config: {},
            status: 400,
            statusText: 'Bad',
        })
        await expect(filterPlayerStats('id', [], [])).rejects.toMatchObject({
            message: Constants.UNABLE_TO_GET_PLAYER_STATS,
        })
    })
})

const game: GameStats = {
    _id: 'game1',
    startTime: '2022-01-01',
    teamOneId: 'team1',
    teamTwoId: 'team2',
    goalsLeader: {
        player: playerOne,
        total: 2,
    },
    assistsLeader: {
        player: playerOne,
        total: 2,
    },
    turnoversLeader: {
        player: playerOne,
        total: 2,
    },
    plusMinusLeader: {
        player: playerOne,
        total: 2,
    },
    pointsPlayedLeader: {
        player: playerOne,
        total: 2,
    },
    blocksLeader: {
        player: playerOne,
        total: 2,
    },
    points: [],
    momentumData: [],
}

describe('getGameStats', () => {
    it('handles network success', async () => {
        jest.spyOn(StatsNetwork, 'getGameStats').mockResolvedValueOnce({
            status: 200,
            statusText: 'Good',
            data: { game },
            headers: {},
            config: {},
        } as AxiosResponse)

        const result = await getGameStats('game1')
        expect(result).toMatchObject(game)
    })

    it('handles network failure', async () => {
        jest.spyOn(StatsNetwork, 'getGameStats').mockRejectedValueOnce({
            status: 500,
            statusText: 'Bad',
            data: { message: 'test error' },
            headers: {},
            config: {},
        })

        await expect(getGameStats('game1')).rejects.toMatchObject({
            message: 'test error',
        })
    })
})

describe('getGameStatsByTeam', () => {
    it('handles network success', async () => {
        jest.spyOn(StatsNetwork, 'getGameStatsByTeam').mockResolvedValueOnce({
            status: 200,
            statusText: 'Good',
            data: { game },
            headers: {},
            config: {},
        } as AxiosResponse)

        const result = await getGameStatsByTeam('game1', 'team1')
        expect(result).toMatchObject(game)
    })

    it('handles network failure', async () => {
        jest.spyOn(StatsNetwork, 'getGameStatsByTeam').mockRejectedValueOnce({
            status: 500,
            statusText: 'Bad',
            data: { message: 'test error' },
            headers: {},
            config: {},
        })

        await expect(
            getGameStatsByTeam('game1', 'team1'),
        ).rejects.toMatchObject({
            message: 'test error',
        })
    })
})

const team: TeamStats = {
    ...teamOne,
    players: [],
    games: [],
    winPercentage: 1,
    offensiveConversion: 0.8,
    defensiveConversion: 0.4,
    wins: 10,
    losses: 0,
    goalsFor: 100,
    goalsAgainst: 67,
    holds: 87,
    breaks: 13,
    turnoverFreeHolds: 45,
    offensePoints: 23,
    defensePoints: 54,
    turnovers: 4,
    turnoversForced: 45,
}

describe('getTeamStats', () => {
    it('handles unfiltered network success', async () => {
        const spy = jest
            .spyOn(StatsNetwork, 'getTeamStats')
            .mockReturnValueOnce(
                Promise.resolve({
                    data: { team },
                    status: 200,
                    statusText: '200',
                    config: {},
                    headers: {},
                } as AxiosResponse),
            )

        const result = await getTeamStats('team1', [])
        expect(result).toMatchObject(team)
        expect(spy).toHaveBeenCalled()
    })

    it('handles filtered network success', async () => {
        const spy = jest
            .spyOn(StatsNetwork, 'getTeamStatsByGame')
            .mockReturnValueOnce(
                Promise.resolve({
                    data: { team },
                    status: 200,
                    statusText: 'Good',
                    headers: {},
                    config: {},
                } as AxiosResponse),
            )

        const result = await getTeamStats('team1', ['game1'])
        expect(result).toMatchObject(team)
        expect(spy).toHaveBeenCalled()
    })

    it('handles network error', async () => {
        jest.spyOn(StatsNetwork, 'getTeamStats').mockReturnValueOnce(
            Promise.reject({
                data: { message: 'test error' },
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(getTeamStats('team1', [])).rejects.toMatchObject({
            message: 'test error',
        })
    })
})
