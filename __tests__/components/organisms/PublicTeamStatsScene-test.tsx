import * as StatsData from '../../../src/services/data/stats'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import PublicTeamStatsScene from '../../../src/components/organisms/PublicTeamStatsScene'
import React from 'react'
import { Team } from '../../../src/types/team'
import { setProfile } from '../../../src/store/reducers/features/account/accountReducer'
import store from '../../../src/store/store'
import { GameStats, TeamStats } from '../../../src/types/stats'
import { QueryClient, QueryClientProvider } from 'react-query'
import { fetchProfileData, game } from '../../../fixtures/data'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

const mockedNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            addListener: jest.fn().mockReturnValue(() => {}),
            navigate: mockedNavigate,
        }),
    }
})
jest.mock('react-native-gifted-charts', () => {
    return {
        BarChart: () => {},
        __esModule: true,
    }
})

jest.mock('react-native-element-dropdown', () => {
    return {
        Dropdown: () => <span>dropdown</span>,
    }
})

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
    momentumData: [],
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
}

const teamStats: TeamStats = {
    ...team,
    players: [],
    games: [game._id],
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
    completionsToScore: [1, 2],
    completionsToTurnover: [3, 4],
}

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})
afterAll(() => {
    jest.useRealTimers()
})

describe('PublicTeamStatsScene', () => {
    const spy = jest.spyOn(StatsData, 'getTeamStats').mockImplementation(() => {
        return Promise.resolve({
            ...teamStats,
            ...team,
            ...gameStats,
            players: [],
        })
    })

    it('displays elements', async () => {
        render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <Provider store={store}>
                        <PublicTeamStatsScene
                            teamId=""
                            games={[]}
                            managers={[]}
                        />
                    </Provider>
                </QueryClientProvider>
            </NavigationContainer>,
        )

        await waitFor(async () =>
            expect(screen.getByText('Overview')).toBeTruthy(),
        )

        expect(screen.getByText('Leaders')).toBeTruthy()
        expect(screen.getByText('Players')).toBeTruthy()

        expect(screen.getByText('Offensive Points')).toBeTruthy()
        expect(screen.getByText('Defensive Points')).toBeTruthy()

        expect(screen.getByText('Completions to Score')).toBeTruthy()
        expect(screen.getByText('Completions to Turnover')).toBeTruthy()

        expect(screen.getByText('Goals')).toBeTruthy()
    })

    it('calls filter', async () => {
        render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <Provider store={store}>
                        <PublicTeamStatsScene
                            teamId="team1"
                            games={[game]}
                            managers={[]}
                        />
                    </Provider>
                </QueryClientProvider>
            </NavigationContainer>,
        )

        await waitFor(async () =>
            expect(screen.getByText('Overview')).toBeTruthy(),
        )

        spy.mockClear()

        const filterBtn = screen.getByText('filter by game')
        fireEvent.press(filterBtn)

        expect(screen.getByText(`vs. ${game.teamTwo.name}`)).toBeTruthy()

        const checkbox = screen.getByTestId('checkbox-0')
        fireEvent(checkbox, 'onChange')

        const doneBtn = screen.getByText('done')
        fireEvent.press(doneBtn)

        expect(spy).toHaveBeenCalledTimes(1)
    })

    it('calls export', async () => {
        const exportSpy = jest
            .spyOn(StatsData, 'exportTeamStats')
            .mockResolvedValueOnce(undefined)

        store.dispatch(setProfile(fetchProfileData))

        render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <Provider store={store}>
                        <PublicTeamStatsScene
                            teamId="team1"
                            games={[game]}
                            managers={[fetchProfileData]}
                        />
                    </Provider>
                </QueryClientProvider>
            </NavigationContainer>,
        )

        await waitFor(async () =>
            expect(screen.getByText('Overview')).toBeTruthy(),
        )

        const exportButton = screen.getByText('export stats')
        fireEvent.press(exportButton)

        const confirmButton = screen.getByText('confirm')
        fireEvent.press(confirmButton)

        await waitFor(() => {
            expect(exportSpy).toHaveBeenCalled()
        })
    })

    it('calls navigate', async () => {
        render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <Provider store={store}>
                        <PublicTeamStatsScene
                            teamId=""
                            games={[]}
                            managers={[]}
                        />
                    </Provider>
                </QueryClientProvider>
            </NavigationContainer>,
        )

        await waitFor(async () =>
            expect(screen.getByText('Overview')).toBeTruthy(),
        )

        const userDisplay = screen.getAllByText('@firstlast1')[1]
        fireEvent.press(userDisplay)

        expect(mockedNavigate).toHaveBeenCalledTimes(1)
    })
})
