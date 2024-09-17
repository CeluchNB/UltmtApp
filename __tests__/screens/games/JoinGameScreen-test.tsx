import * as AuthServices from '../../../src/services/network/auth'
import * as Constants from '../../../src/utils/constants'
import * as GameData from '../../../src/services/data/game'
import * as GameNetwork from '../../../src/services/network/game'
import { AxiosResponse } from 'axios'
import { DisplayTeamFactory } from '../../test-data/team'
import { GameFactory } from '../../test-data/game'
import { JoinGameProps } from '../../../src/types/navigation'
import JoinGameScreen from '../../../src/screens/games/JoinGameScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import React from 'react'
import store from '../../../src/store/store'
import { withRealm } from '../../utils/renderers'
import {
    CreateGameContext,
    CreateGameContextData,
    CreateGameProvider,
} from '../../../src/context/create-game-context'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const setOptions = jest.fn()

const props: JoinGameProps = {
    navigation: { navigate: jest.fn(), setOptions } as any,
    route: {} as any,
}

const client = new QueryClient()

describe('JoinGameScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    const game = GameFactory.build()
    beforeEach(() => {
        jest.spyOn(GameData, 'searchGames').mockReturnValueOnce(
            Promise.resolve([game]),
        )
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <CreateGameProvider>
                                <JoinGameScreen {...props} />
                            </CreateGameProvider>
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        await waitForElementToBeRemoved(() =>
            snapshot.getByTestId('search-indicator'),
        )

        expect(snapshot).toMatchSnapshot()
    })

    it('should handle search', async () => {
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <CreateGameProvider>
                                <JoinGameScreen {...props} />
                            </CreateGameProvider>
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        const search = screen.getByPlaceholderText('Search Games...')
        fireEvent.changeText(search, game.teamTwo.name)

        await waitFor(() => {
            expect(
                screen.getAllByText(game.teamTwo.name).length,
            ).toBeGreaterThan(0)
        })
    })

    it('should handle join', async () => {
        jest.spyOn(GameNetwork, 'joinGame').mockReturnValueOnce(
            Promise.resolve({
                data: { game: GameFactory.build(), token: 'token' },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <CreateGameContext.Provider
                                value={
                                    {
                                        teamOne: DisplayTeamFactory.build(),
                                    } as CreateGameContextData
                                }>
                                <JoinGameScreen {...props} />
                            </CreateGameContext.Provider>
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        const search = screen.getByPlaceholderText('Search Games...')
        fireEvent.changeText(search, game.teamTwo.name)

        await waitFor(() => {
            expect(
                screen.getAllByText(game.teamTwo.name).length,
            ).toBeGreaterThan(0)
        })

        const gameCard = screen.getAllByText(game.teamTwo.name)[0]
        fireEvent.press(gameCard)

        await waitFor(() => {
            expect(screen.getByText('Join With Code')).toBeTruthy()
        })

        const input = screen.getByPlaceholderText('6 Digit Code')
        fireEvent.changeText(input, '123456')

        const button = screen.getByText('join')
        fireEvent.press(button)

        await waitFor(() => {
            expect(props.navigation.navigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'FirstPoint',
                params: {
                    gameId: game._id,
                    team: 'two',
                },
            })
        })
    })

    it('should handle error joining', async () => {
        RNEncryptedStorage.getItem.mockReturnValue(Promise.resolve('token'))
        jest.spyOn(AuthServices, 'refreshToken').mockReturnValue(
            Promise.resolve({
                data: { tokens: { access: 'access', refresh: 'refresh' } },
                status: 200,
            } as AxiosResponse),
        )
        jest.spyOn(GameNetwork, 'joinGame').mockReturnValue(
            Promise.resolve({
                data: { message: Constants.JOIN_GAME_ERROR },
                status: 400,
                statusText: 'Bad',
            } as AxiosResponse),
        )
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <CreateGameContext.Provider
                                value={
                                    {
                                        teamOne: DisplayTeamFactory.build(),
                                    } as CreateGameContextData
                                }>
                                <JoinGameScreen {...props} />
                            </CreateGameContext.Provider>
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        const search = screen.getByPlaceholderText('Search Games...')
        fireEvent.changeText(search, game.teamTwo.name)

        await waitFor(() => {
            expect(screen.getByText(game.teamTwo.name)).toBeTruthy()
        })

        const gameCard = screen.getAllByText(game.teamTwo.name)[0]
        fireEvent.press(gameCard)

        await waitFor(() => {
            expect(screen.getByText('Join With Code')).toBeTruthy()
        })

        const input = screen.getByPlaceholderText('6 Digit Code')
        fireEvent.changeText(input, '123456')

        const button = screen.getByText('join')
        fireEvent.press(button)

        await waitFor(() => {
            expect(screen.getByText(Constants.JOIN_GAME_ERROR)).toBeTruthy()
        })
    })
})
