import * as TournamentData from '../../../src/services/data/tournament'
import { CreateGameProvider } from '../../../src/context/create-game-context'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { SearchTournamentProps } from '../../../src/types/navigation'
import SearchTournamentScreen from '../../../src/screens/games/SearchTournamentScreen'
import store from '../../../src/store/store'
import { tourney } from '../../../fixtures/data'
import { withRealm } from '../../utils/renderers'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

const goBack = jest.fn()
const props: SearchTournamentProps = {
    navigation: { goBack } as any,
    route: {} as any,
}

const client = new QueryClient()

describe('SearchTournamentScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders', async () => {
        render(
            <Provider store={store}>
                <NavigationContainer>
                    <SearchTournamentScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )
        await act(async () => {})
        expect(
            screen.getByPlaceholderText('Search Tournaments...'),
        ).toBeTruthy()
    })

    it('handles search and click', async () => {
        const spy = jest
            .spyOn(TournamentData, 'searchTournaments')
            .mockReturnValue(Promise.resolve([tourney]))
        const { getByText, getByPlaceholderText } = render(
            withRealm(
                <Provider store={store}>
                    <NavigationContainer>
                        <QueryClientProvider client={client}>
                            <CreateGameProvider>
                                <SearchTournamentScreen {...props} />
                            </CreateGameProvider>
                        </QueryClientProvider>
                    </NavigationContainer>
                </Provider>,
            ),
        )

        const input = getByPlaceholderText('Search Tournaments...')
        fireEvent.changeText(input, 'tourney')

        await waitFor(async () => {
            expect(getByText(tourney.name)).toBeTruthy()
        })
        expect(spy).toHaveBeenCalledWith('tourney')

        const tourneyItem = getByText(tourney.name)
        fireEvent.press(tourneyItem)

        expect(goBack).toHaveBeenCalled()
    })

    it('displays error', async () => {
        const spy = jest
            .spyOn(TournamentData, 'searchTournaments')
            .mockReturnValue(Promise.reject({ message: 'test error' }))
        const { getByText, getByPlaceholderText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <SearchTournamentScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        const input = getByPlaceholderText('Search Tournaments...')
        fireEvent.changeText(input, 'tourney')

        await waitFor(async () => {
            expect(getByText('test error')).toBeTruthy()
        })
        expect(spy).toHaveBeenCalledWith('tourney')
    })
})
