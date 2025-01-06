import * as GameServices from '../../../src/services/data/game'
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
    waitFor
} from '@testing-library/react-native'

import MockDate from 'mockdate'
MockDate.set('01 October 2022 00:00 UTC')

jest.mock('../../../src/components/atoms/GameCard', () => () => {
    return <div>Game</div>
})

const props: GameSearchProps = {
    navigation: {} as any,
    route: { params: { live: 'true' } } as any,
}
const client = new QueryClient()

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})

afterAll(() => {
    jest.useRealTimers()
})

beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(GameServices, 'searchGames').mockReturnValueOnce(
        Promise.resolve([game]),
    )
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
    const spy = jest
        .spyOn(GameServices, 'searchGames')
        .mockReturnValueOnce(Promise.resolve([game]))
    const { getByPlaceholderText, queryByText } = render(
        <NavigationContainer>
            <QueryClientProvider client={client}>
                <GameSearchScreen {...props} />
            </QueryClientProvider>
        </NavigationContainer>,
    )

    const searchBar = getByPlaceholderText('Search...')
    fireEvent.changeText(searchBar, 'text')
    await act(async () => {})

    const result = await queryByText('Game')
    expect(result).toBeNull()

    expect(spy).toHaveBeenCalled()
})

it('should use filter modal', async () => {
    const spy = jest
        .spyOn(GameServices, 'searchGames')
        .mockReturnValueOnce(Promise.resolve([game]))

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

    const result = await queryByText('Game')
    expect(result).toBeNull()

    expect(spy).toHaveBeenCalled()
})

it('should load more on scroll', async () => {
    const spy = jest
        .spyOn(GameServices, 'searchGames')
        .mockReturnValueOnce(Promise.resolve([game]))

    const { getByTestId } = render(
        <NavigationContainer>
            <QueryClientProvider client={client}>
                <GameSearchScreen {...props} />
            </QueryClientProvider>
        </NavigationContainer>,
    )

    const scrollView = getByTestId('game-search-list')
    fireEvent(scrollView, 'onEndReached')

    await waitFor(async () => {
        expect(spy).toHaveBeenCalledTimes(2)
    })
})
