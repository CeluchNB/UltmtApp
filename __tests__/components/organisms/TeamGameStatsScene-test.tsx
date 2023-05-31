import * as StatsData from '../../../src/services/data/stats'
import { GameStats } from '../../../src/types/stats'
import React from 'react'
import TeamGameStatsScene from '../../../src/components/organisms/TeamGameStatsScene'
import { QueryClient, QueryClientProvider } from 'react-query'
import { render, screen, waitFor } from '@testing-library/react-native'

const playerOne = {
    _id: 'user1',
    firstName: 'First 1',
    lastName: 'Last 1',
    username: 'firstlast1',
}
const gameStats: GameStats = {
    _id: 'game1',
    startTime: '01/01/2023',
    teamOneId: 'team1',
    points: [],
    goalsLeader: {
        player: playerOne,
        total: 1,
    },
    assistsLeader: {
        player: playerOne,
        total: 1,
    },
    blocksLeader: {
        player: playerOne,
        total: 1,
    },
    turnoversLeader: {
        player: playerOne,
        total: 1,
    },
    plusMinusLeader: {
        player: playerOne,
        total: 1,
    },
    pointsPlayedLeader: {
        player: playerOne,
        total: 1,
    },
}

const client = new QueryClient()

describe('TeamGameStatsScene', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders without team id', async () => {
        const spy = jest
            .spyOn(StatsData, 'getGameStatsByTeam')
            .mockReturnValue(Promise.reject({}))

        render(
            <QueryClientProvider client={client}>
                <TeamGameStatsScene gameId="game1" />
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(spy).toHaveBeenCalledTimes(1)
        })
        expect(
            screen.getByText(
                'This team is not contributing stats for this game.',
            ),
        ).toBeTruthy()
    })

    it('renders leaders', async () => {
        const spy = jest
            .spyOn(StatsData, 'getGameStatsByTeam')
            .mockReturnValue(Promise.resolve({ ...gameStats, players: [] }))

        render(
            <QueryClientProvider client={client}>
                <TeamGameStatsScene gameId="game1" teamId="team1" />
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Leaderboard')).toBeTruthy()
        })
        expect(spy).toHaveBeenCalledTimes(1)
        expect(screen.getAllByText('1').length).toBe(6)
        expect(screen.getAllByText('First 1 Last 1').length).toBe(6)
    })
})
