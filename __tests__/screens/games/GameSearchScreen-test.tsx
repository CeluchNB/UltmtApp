import * as GameServices from '../../../src/services/network/game'
import { GameSearchProps } from '../../../src/types/navigation'
import GameSearchScreen from '../../../src/screens/games/GameSearchScreen'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { game } from '../../../fixtures/data'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    act,
    fireEvent,
    render,
    waitForElementToBeRemoved,
} from '@testing-library/react-native'

import MockDate from 'mockdate'
MockDate.set('01 October 2022 00:00 UTC')

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('../../../src/components/atoms/GameCard', () => () => {
    return <div>Game</div>
})

const props: GameSearchProps = {
    navigation: {} as any,
    route: { params: { live: 'true' } } as any,
}
const client = new QueryClient()

beforeAll(() => {
    jest.useFakeTimers()
})

beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(GameServices, 'searchGames').mockReturnValueOnce(
        Promise.resolve({
            data: { games: [game] },
            status: 200,
            statusText: 'Good',
            headers: {},
            config: {},
        }),
    )
})

afterAll(() => {
    jest.useRealTimers()
})

it('should match snapshot', async () => {
    const snapshot = render(
        <NavigationContainer>
            <QueryClientProvider client={client}>
                <GameSearchScreen {...props} />
            </QueryClientProvider>
        </NavigationContainer>,
    )

    await waitForElementToBeRemoved(() =>
        snapshot.getByTestId('infinite-scroll-indicator'),
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should search', async () => {
    const spy = jest.spyOn(GameServices, 'searchGames').mockReturnValueOnce(
        Promise.resolve({
            data: { games: [] },
            status: 200,
            statusText: 'Good',
            headers: {},
            config: {},
        }),
    )
    const { getByPlaceholderText, queryByText } = render(
        <NavigationContainer>
            <QueryClientProvider client={client}>
                <GameSearchScreen {...props} />
            </QueryClientProvider>
        </NavigationContainer>,
    )

    const searchBar = getByPlaceholderText('Search games...')
    fireEvent.changeText(searchBar, 'text')
    await act(async () => {})

    const result = await queryByText('Game')
    expect(result).toBeNull()

    expect(spy).toHaveBeenCalled()
})

it('should use filter modal', async () => {
    const spy = jest.spyOn(GameServices, 'searchGames').mockReturnValueOnce(
        Promise.resolve({
            data: { games: [] },
            status: 200,
            statusText: 'Good',
            headers: {},
            config: {},
        }),
    )

    const { getByText, queryByText } = render(
        <NavigationContainer>
            <QueryClientProvider client={client}>
                <GameSearchScreen {...props} />
            </QueryClientProvider>
        </NavigationContainer>,
    )

    const searchBar = getByText('Filter')
    fireEvent.press(searchBar)

    const doneButton = getByText('done')
    fireEvent.press(doneButton)
    await act(async () => {})

    const result = await queryByText('Game')
    expect(result).toBeNull()

    expect(spy).toHaveBeenCalled()
})

it('should load more on scroll', async () => {
    const spy = jest.spyOn(GameServices, 'searchGames').mockReturnValueOnce(
        Promise.resolve({
            data: { games: [game] },
            status: 200,
            statusText: 'Good',
            headers: {},
            config: {},
        }),
    )

    const { getByTestId } = render(
        <NavigationContainer>
            <QueryClientProvider client={client}>
                <GameSearchScreen {...props} />
            </QueryClientProvider>
        </NavigationContainer>,
    )

    const scrollView = getByTestId('game-search-list')
    fireEvent.scroll(scrollView, {
        nativeEvent: {
            contentSize: { height: 100, width: 100 },
            contentOffset: { y: 10, x: 0 },
            layoutMeasurement: { height: 100, width: 100 }, // Dimensions of the device
        },
    })
    await act(async () => {})

    expect(spy).toHaveBeenCalledTimes(2)
})
