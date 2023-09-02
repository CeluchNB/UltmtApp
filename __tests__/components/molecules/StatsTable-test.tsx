import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import StatsTable from '../../../src/components/molecules/StatsTable'
import { FilteredGamePlayer, FilteredGameStats } from '../../../src/types/stats'
import {
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

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

const playerOne = {
    _id: 'user1',
    firstName: 'First 1',
    lastName: 'Last 1',
    username: 'firstlast1',
}
const playerStatsOne: FilteredGamePlayer = {
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

const playerStatsTwo: FilteredGamePlayer = {
    _id: 'player2',
    firstName: 'First 2',
    lastName: 'Last 2',
    username: 'player2',
    goals: 2,
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

const data: FilteredGameStats = {
    _id: 'game1',
    startTime: '01/01/2023',
    teamOneId: 'team1',
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
    players: [playerStatsOne, playerStatsTwo],
}

describe('StatsTable', () => {
    it('render initial stats', () => {
        render(
            <NavigationContainer>
                <StatsTable players={data.players} />
            </NavigationContainer>,
        )

        expect(screen.getByText('Player')).toBeTruthy()
        expect(screen.getByText('Overall')).toBeTruthy()
        expect(screen.getByText('Offense')).toBeTruthy()
        expect(screen.getByText('Defense')).toBeTruthy()
        expect(screen.getByText('Per Point')).toBeTruthy()
        expect(screen.getByText('First 1 Last 1')).toBeTruthy()
        expect(screen.getByText('Plus / Minus')).toBeTruthy()
        expect(screen.getByText('Catches')).toBeTruthy()
        expect(screen.getByText('Hockey Assists')).toBeTruthy()
        expect(screen.queryByText('Blocks')).toBeNull()
        expect(screen.queryByText('Assists per point')).toBeNull()
    })

    it('handles player press', () => {
        render(
            <NavigationContainer>
                <StatsTable players={data.players} />
            </NavigationContainer>,
        )

        expect(screen.getByText('Player')).toBeTruthy()
        const playerItem = screen.getByText('First 1 Last 1')
        fireEvent.press(playerItem)

        expect(mockedNavigate).toHaveBeenCalledTimes(1)
    })

    it('renders defense and per point stats', () => {
        render(
            <NavigationContainer>
                <StatsTable players={data.players} />
            </NavigationContainer>,
        )

        const overallBtn = screen.getByText('Overall')
        const offenseBtn = screen.getByText('Offense')
        const defenseBtn = screen.getByText('Defense')
        const perPointBtn = screen.getByText('Per Point')

        fireEvent.press(overallBtn)
        fireEvent.press(offenseBtn)
        fireEvent.press(defenseBtn)
        fireEvent.press(perPointBtn)

        expect(screen.getByText('Player')).toBeTruthy()
        expect(screen.getByText('First 1 Last 1')).toBeTruthy()
        expect(screen.queryByText('Plus / Minus')).toBeNull()
        expect(screen.queryByText('Catches')).toBeNull()
        expect(screen.getByText('Blocks')).toBeTruthy()
        expect(screen.getByText('Assists per point')).toBeTruthy()
    })

    it('handles sort', () => {
        render(
            <NavigationContainer>
                <StatsTable players={data.players} />
            </NavigationContainer>,
        )

        expect(screen.getByText('Player')).toBeTruthy()
        expect(screen.getByText('First 1 Last 1')).toBeTruthy()

        const goalsBtn = screen.getByText('Goals')
        fireEvent.press(goalsBtn)

        const descElements = screen.getAllByTestId('name-record')
        const { queryByText: queryDescFirstElementByText } = within(
            descElements[0],
        )
        expect(queryDescFirstElementByText('First 2 Last 2')).toBeTruthy()
        const { queryByText: queryDescSecondElementByText } = within(
            descElements[1],
        )
        expect(queryDescSecondElementByText('First 1 Last 1')).toBeTruthy()

        fireEvent.press(goalsBtn)

        const ascElements = screen.getAllByTestId('name-record')
        const { queryByText: queryAscFirstElementByText } = within(
            ascElements[0],
        )
        expect(queryAscFirstElementByText('First 1 Last 1')).toBeTruthy()
        const { queryByText: queryAscSecondElementByText } = within(
            ascElements[1],
        )
        expect(queryAscSecondElementByText('First 2 Last 2')).toBeTruthy()

        fireEvent.press(goalsBtn)

        const unsortedElements = screen.getAllByTestId('name-record')
        const { queryByText: queryUnsortedFirstElementByText } = within(
            unsortedElements[0],
        )
        expect(queryUnsortedFirstElementByText('First 1 Last 1')).toBeTruthy()
        const { queryByText: queryUnsortedSecondElementByText } = within(
            unsortedElements[1],
        )
        expect(queryUnsortedSecondElementByText('First 2 Last 2')).toBeTruthy()
    })
})
