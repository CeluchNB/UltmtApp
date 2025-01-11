import * as GameNetwork from '../../src/services/network/game'
import * as StatsNetwork from '../../src/services/network/stats'
import * as UserData from '../../src/services/data/user'
import { ActiveGamesProps } from '../../src/types/navigation'
import ActiveGamesScreen from '../../src/screens/ActiveGamesScreen'
import { AxiosResponse } from 'axios'
import { DisplayUserFactory } from '../test-data/user'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { withRealm } from '../utils/renderers'
import { GameFactory, GameStatsFactory } from '../test-data/game'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

const mockedNavigate = jest.fn()
const setOptions = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
        }),
    }
})

const props: ActiveGamesProps = {
    navigation: {
        mockedNavigate,
        setOptions,
        addListener: () => {
            return () => {}
        },
    } as any,
    route: {} as any,
}

const client = new QueryClient()

describe('ActiveGamesScreen', () => {
    const creator = DisplayUserFactory.build()
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    beforeEach(() => {
        jest.resetAllMocks()
        jest.spyOn(UserData, 'getUserId').mockReturnValue(
            Promise.resolve(creator._id),
        )
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders without games', async () => {
        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ActiveGamesScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>,
            ),
        )
        expect(screen.getByText('No active games')).toBeTruthy()
    })

    it('renders with games', async () => {
        const game1 = GameFactory.build({ creator })
        const game2 = GameFactory.build({ creator })
        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ActiveGamesScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>,
                realm => {
                    realm.write(() => {
                        realm.create('Game', {
                            ...game1,
                            offline: false,
                        })
                        realm.create('Game', {
                            ...game2,
                            offline: false,
                        })
                    })
                },
            ),
        )

        await waitFor(async () => {
            expect(
                screen.getByText(
                    `vs. ${game1.teamTwo.place} ${game1.teamTwo.name}`,
                ),
            ).toBeTruthy()
            expect(
                screen.getByText(
                    `vs. ${game2.teamTwo.place} ${game2.teamTwo.name}`,
                ),
            ).toBeTruthy()
        })
    })

    it('navigates without a point', async () => {
        const game1 = GameFactory.build({ creator })
        const game2 = GameFactory.build({ creator })
        jest.spyOn(GameNetwork, 'reenterGame').mockReturnValueOnce(
            Promise.resolve({
                data: {
                    game: { ...game1, offline: false, statsPoints: [] },
                    team: 'one',
                    activePoint: undefined,
                    hasActiveActions: false,
                },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        jest.spyOn(StatsNetwork, 'getGameStats').mockReturnValue(
            Promise.resolve({
                data: { game: GameStatsFactory.build() },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )

        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ActiveGamesScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>,
                realm => {
                    realm.write(() => {
                        realm.create('Game', {
                            ...game1,
                            offline: false,
                        })
                        realm.create('Game', {
                            ...game2,
                            offline: false,
                        })
                    })
                },
            ),
        )
        await waitFor(async () => {
            expect(
                screen.getByText(
                    `vs. ${game1.teamTwo.place} ${game1.teamTwo.name}`,
                ),
            ).toBeTruthy()
        })

        fireEvent.press(
            screen.getByText(
                `vs. ${game1.teamTwo.place} ${game1.teamTwo.name}`,
            ),
        )

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'FirstPoint',
                params: {
                    gameId: game1._id,
                    team: 'one',
                },
            })
        })
    })

    it('deletes a game', async () => {
        const game1 = GameFactory.build({ creator })
        const game2 = GameFactory.build({ creator })
        const spy = jest.spyOn(GameNetwork, 'deleteGame').mockReturnValueOnce(
            Promise.resolve({
                data: {},
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ActiveGamesScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>,
                realm => {
                    realm.write(() => {
                        realm.create('Game', {
                            ...game1,
                            offline: false,
                        })
                        realm.create('Game', {
                            ...game2,
                            offline: false,
                        })
                    })
                },
            ),
        )

        await waitFor(async () => {
            expect(
                screen.getByText(
                    `vs. ${game1.teamTwo.place} ${game1.teamTwo.name}`,
                ),
            ).toBeTruthy()
        })

        const deleteBtn1 = screen.getAllByTestId('delete-button')[0]
        fireEvent.press(deleteBtn1)

        const confirmBtn = screen.getByText('confirm')
        fireEvent.press(confirmBtn)

        await waitFor(() => {
            expect(spy).toHaveBeenCalledTimes(1)
        })

        const deleteBtn2 = screen.getAllByTestId('delete-button')[0]
        fireEvent.press(deleteBtn2)

        const cancelBtn = screen.getByText('cancel')
        fireEvent.press(cancelBtn)

        await waitFor(() => {
            expect(screen.queryByText('cancel')).toBeNull()
        })
        expect(spy).toHaveBeenCalledTimes(1)
    })
})
