import * as StatsData from '../../../src/services/data/stats'
import PublicTeamStatsScene from '../../../src/components/organisms/PublicTeamStatsScene'
import React from 'react'
import { Team } from '../../../src/types/team'
import { GameStats, TeamStats } from '../../../src/types/stats'
import { QueryClient, QueryClientProvider } from 'react-query'
import { render, screen, waitFor } from '@testing-library/react-native'

const client = new QueryClient()

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

const team: Team = {
    _id: 'id1',
    place: 'Place',
    name: 'Name',
    teamname: 'placename',
    managers: [],
    players: [
        {
            _id: 'id',
            firstName: 'First',
            lastName: 'Last',
            username: 'firstlast',
        },
    ],
    seasonNumber: 1,
    seasonStart: '2022',
    seasonEnd: '2022',
    continuationId: 'id123',
    rosterOpen: true,
    requests: [],
    games: [],
}

const teamStats: TeamStats = {
    ...team,
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

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})
afterAll(() => {
    jest.useRealTimers()
})

describe('PublicTeamStatsScene', () => {
    it('displays elements', async () => {
        jest.spyOn(StatsData, 'getTeamStats').mockImplementation(() => {
            return Promise.resolve({
                ...teamStats,
                ...team,
                ...gameStats,
                players: [],
            })
        })

        render(
            <QueryClientProvider client={client}>
                <PublicTeamStatsScene teamId="" games={[]} />
            </QueryClientProvider>,
        )

        await waitFor(async () =>
            expect(screen.getByText('Overview')).toBeTruthy(),
        )

        expect(screen.getByText('Leaders')).toBeTruthy()
        expect(screen.getByText('Players')).toBeTruthy()

        expect(screen.getByText('Offensive Points')).toBeTruthy()
        expect(screen.getByText('Defensive Points')).toBeTruthy()

        expect(screen.getByText('Goals')).toBeTruthy()
    })
})
