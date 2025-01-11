import * as StatsData from '../../src/services/data/stats'
import * as TeamData from '../../src/services/data/team'
import { NavigationContainer } from '@react-navigation/native'
import { PublicTeamDetailsProps } from '../../src/types/navigation'
import PublicTeamScreen from '../../src/screens/PublicTeamScreen'
import React from 'react'
import { Team } from '../../src/types/team'
import { GameStats, TeamStats } from '../../src/types/stats'
import { QueryClient, QueryClientProvider } from 'react-query'
import { act, fireEvent, render, screen } from '@testing-library/react-native'

jest.mock('react-native-element-dropdown', () => {
    return {
        Dropdown: () => <span>dropdown</span>,
    }
})

const client = new QueryClient()

const navigate = jest.fn()
const addListener = jest.fn()
const setOptions = jest.fn()
const mockedNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
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

const props: PublicTeamDetailsProps = {
    navigation: {
        navigate,
        addListener,
        setOptions,
        isFocused: () => true,
    } as any,
    route: {
        params: { id: 'id1', place: 'Place', name: 'Name' },
    } as any,
}

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
    completionsToScore: [],
    completionsToTurnover: [],
}

beforeEach(() => {
    navigate.mockReset()
    addListener.mockReset()
})

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})
afterAll(() => {
    jest.useRealTimers()
})

it('should handle player click', async () => {
    const spy = jest
        .spyOn(TeamData, 'getTeam')
        .mockReturnValueOnce(Promise.resolve(team))
    jest.spyOn(StatsData, 'getTeamStats').mockImplementation(() => {
        return Promise.resolve({
            ...teamStats,
            ...team,
            ...gameStats,
            players: [],
        })
    })

    render(
        <NavigationContainer>
            <QueryClientProvider client={client}>
                <PublicTeamScreen {...props} />
            </QueryClientProvider>
        </NavigationContainer>,
    )
    await act(async () => {
        const scrollView = screen.getByTestId('public-team-scroll-view')
        const { refreshControl } = scrollView.props
        refreshControl.props.onRefresh()
    })

    const playerView = screen.getByText(
        `${team.players[0].firstName} ${team.players[0].lastName}`,
    )
    expect(screen.getAllByText('Players').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Stats').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Years').length).toBeGreaterThan(0)

    fireEvent.press(playerView)
    expect(mockedNavigate).toHaveBeenCalled()
    spy.mockRestore()
})

it('should handle get team error', async () => {
    const spy = jest
        .spyOn(TeamData, 'getTeam')
        .mockReturnValueOnce(Promise.reject({ message: 'error' }))
    jest.spyOn(StatsData, 'getTeamStats').mockReturnValue(
        Promise.resolve({
            ...teamStats,
            ...team,
            ...gameStats,
            players: [],
        }),
    )
    render(
        <NavigationContainer>
            <QueryClientProvider client={client}>
                <PublicTeamScreen {...props} />
            </QueryClientProvider>
        </NavigationContainer>,
    )

    await act(async () => {
        const scrollView = screen.getByTestId('public-team-scroll-view')
        const { refreshControl } = scrollView.props
        refreshControl.props.onRefresh()
    })

    const errorText = screen.getByText('error')
    expect(screen.getAllByText('Players').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Stats').length).toBeGreaterThan(1)

    expect(errorText).toBeTruthy()
    spy.mockRestore()
})

it('should get archive team and handle player click', async () => {
    const spy = jest
        .spyOn(TeamData, 'getArchivedTeam')
        .mockReturnValueOnce(Promise.resolve(team))
    jest.spyOn(StatsData, 'getTeamStats').mockReturnValue(
        Promise.resolve({
            ...teamStats,
            ...team,
            ...gameStats,
            players: [],
        }),
    )
    const tempProps: PublicTeamDetailsProps = {
        navigation: {
            navigate,
            addListener,
            setOptions,
            isFocused: () => true,
        } as any,
        route: {
            params: { id: 'id1', place: 'Place', name: 'Name', archive: true },
        } as any,
    }
    render(
        <NavigationContainer>
            <QueryClientProvider client={client}>
                <PublicTeamScreen {...tempProps} />
            </QueryClientProvider>
        </NavigationContainer>,
    )

    await act(async () => {
        const scrollView = screen.getByTestId('public-team-scroll-view')
        const { refreshControl } = scrollView.props
        refreshControl.props.onRefresh()
    })

    const playerView = screen.getByText(
        `${team.players[0].firstName} ${team.players[0].lastName}`,
    )

    expect(screen.getAllByText('Players').length).toBeGreaterThan(1)
    expect(screen.getAllByText('Stats').length).toBeGreaterThan(1)

    fireEvent.press(playerView)
    expect(mockedNavigate).toHaveBeenCalled()
    spy.mockRestore()
})
