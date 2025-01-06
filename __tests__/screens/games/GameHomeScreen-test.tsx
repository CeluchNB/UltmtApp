import * as GameServices from '../../../src/services/data/game'
import * as UserServices from '../../../src/services/data/user'
import GameHomeScreen from '../../../src/screens/games/GameHomeScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { render } from '@testing-library/react-native'
import store from '../../../src/store/store'
import { waitUntilRefreshComplete } from '../../../fixtures/utils'
import { QueryClient, QueryClientProvider } from 'react-query'
import { fetchProfileData, game } from '../../../fixtures/data'

jest.mock('../../../src/components/atoms/GameCard', () => () => {
    return <div>Game</div>
})

const props = {
    navigation: {
        navigate: jest.fn(),
        addListener: jest.fn(),
    } as any,
    route: {} as any,
}

const client = new QueryClient()

describe('GameHomeScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    beforeEach(() => {
        jest.spyOn(GameServices, 'searchGames').mockReturnValueOnce(
            Promise.resolve([
                game,
                {
                    ...game,
                    _id: 'game2',
                    teamTwo: { name: 'Team 7' },
                    teamTwoScore: 7,
                },
            ]),
        )

        jest.spyOn(UserServices, 'fetchProfile').mockReturnValueOnce(
            Promise.resolve(fetchProfileData),
        )
    })

    it('should match snapshot with live and recent data', async () => {
        const snapshot = render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <GameHomeScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>
            </Provider>,
        )

        await waitUntilRefreshComplete(
            snapshot.getByTestId('game-home-scroll-view'),
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should match snapshot with no data', async () => {
        jest.spyOn(GameServices, 'searchGames')
            .mockReset()
            .mockReturnValueOnce(Promise.resolve([]))

        const snapshot = render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <GameHomeScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>
            </Provider>,
        )

        await waitUntilRefreshComplete(
            snapshot.getByTestId('game-home-scroll-view'),
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })
})
