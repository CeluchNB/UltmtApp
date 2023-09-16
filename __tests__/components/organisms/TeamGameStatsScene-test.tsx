import * as StatsData from '../../../src/services/data/stats'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import TeamGameStatsScene from '../../../src/components/organisms/TeamGameStatsScene'
import { teamOne } from '../../../fixtures/data'
import {
    FilteredGamePlayer,
    GameStats,
    TeamStats,
} from '../../../src/types/stats'
import { QueryClient, QueryClientProvider } from 'react-query'
import { render, screen, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

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
    momentumData: [],
}

const teamStats: TeamStats = {
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

const player: FilteredGamePlayer = {
    ...playerOne,
    goals: 1,
    assists: 1,
    hockeyAssists: 0,
    blocks: 1,
    throwaways: 1,
    throwingPercentage: 0.98,
    droppedPasses: 0,
    drops: 1,
    callahans: 0,
    stalls: 0,
    catches: 4,
    touches: 5,
    completedPasses: 4,
    pointsPlayed: 3,
    pulls: 0,
    wins: 0,
    losses: 1,
    ppAssists: 0.1,
    ppBlocks: 0.1,
    ppDrops: 0,
    ppGoals: 0.1,
    ppThrowaways: 1,
    plusMinus: 2,
    winPercentage: 0.8,
    catchingPercentage: 1,
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
        const gameSpy = jest
            .spyOn(StatsData, 'getGameStatsByTeam')
            .mockReturnValue(Promise.reject({}))
        const teamSpy = jest
            .spyOn(StatsData, 'getTeamStats')
            .mockReturnValue(Promise.reject({}))

        render(
            <QueryClientProvider client={client}>
                <NavigationContainer>
                    <TeamGameStatsScene gameId="game1" />
                </NavigationContainer>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(gameSpy).toHaveBeenCalledTimes(1)
        })
        expect(teamSpy).toHaveBeenCalledTimes(1)
        expect(
            screen.getByText(
                'This team is not contributing stats for this game.',
            ),
        ).toBeTruthy()
    })

    it('renders populated scene', async () => {
        const gameSpy = jest
            .spyOn(StatsData, 'getGameStatsByTeam')
            .mockReturnValue(
                Promise.resolve({ ...gameStats, players: [player] }),
            )
        jest.spyOn(StatsData, 'getTeamStats').mockReturnValue(
            Promise.resolve({ ...teamStats, ...gameStats, players: [player] }),
        )

        render(
            <QueryClientProvider client={client}>
                <NavigationContainer>
                    <TeamGameStatsScene gameId="game1" teamId="team1" />
                </NavigationContainer>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Leaderboard')).toBeTruthy()
        })
        expect(gameSpy).toHaveBeenCalledTimes(1)
        expect(screen.getAllByText('1').length).toBe(14)
        expect(screen.getAllByText('First 1 Last 1').length).toBe(7)
        expect(screen.getByText('Stats')).toBeTruthy()
        expect(screen.getByText('Game Overview')).toBeTruthy()
        expect(screen.getByText('Leaderboard')).toBeTruthy()
        expect(screen.getAllByText('Assists').length).toBe(2)
        expect(screen.getAllByText('Goals').length).toBe(2)
        expect(screen.getByText('Blocks')).toBeTruthy()
        expect(screen.getByText('Drops')).toBeTruthy()
    })
})
