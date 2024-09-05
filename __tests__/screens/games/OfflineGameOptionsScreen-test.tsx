import * as GameData from '../../../src/services/data/game'
import * as GameNetwork from '../../../src/services/network/game'
import * as StatsNetwork from '../../../src/services/network/stats'
import * as TeamNetwork from '../../../src/services/network/team'
import { AxiosResponse } from 'axios'
import { Game } from '../../../src/types/game'
import { NavigationContainer } from '@react-navigation/native'
import { OfflineGameOptionsProps } from '../../../src/types/navigation'
import OfflineGameOptionsScreen from '../../../src/screens/games/OfflineGameOptionsScreen'
import { Provider } from 'react-redux'
import React from 'react'
import { TeamFactory } from '../../test-data/team'
import { fetchProfileData } from '../../../fixtures/data'
import { setProfile } from '../../../src/store/reducers/features/account/accountReducer'
import store from '../../../src/store/store'
import { withRealm } from '../../utils/renderers'
import { GameFactory, GameStatsFactory } from '../../test-data/game'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

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

const createGame = (overrides: Partial<Game>): Game & { offline: boolean } => {
    return {
        ...game,
        offline: false,
        ...overrides,
    }
}

const game = GameFactory.build()
const team = TeamFactory.build({ _id: game.teamOne._id })
const gameStats = GameStatsFactory.build()
const props: OfflineGameOptionsProps = {
    navigation: {
        navigate: mockedNavigate,
    } as any,
    route: { params: { gameId: game._id } } as any,
}

const client = new QueryClient()

beforeEach(async () => {
    jest.resetAllMocks()
    store.dispatch(setProfile(fetchProfileData))
    jest.spyOn(GameData, 'getOfflineGameById').mockReturnValue(
        Promise.resolve(
            createGame({
                creator: {
                    _id: fetchProfileData._id,
                    firstName: fetchProfileData.firstName,
                    lastName: fetchProfileData.lastName,
                    username: fetchProfileData.username,
                },
            }),
        ),
    )
})

describe('OfflineGameOptionsScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders', async () => {
        render(
            withRealm(
                <Provider store={store}>
                    <NavigationContainer>
                        <QueryClientProvider client={client}>
                            <OfflineGameOptionsScreen {...props} />
                        </QueryClientProvider>
                    </NavigationContainer>
                </Provider>,
            ),
        )

        await waitFor(async () => {
            expect(screen.getByText(game.teamOne.name)).toBeTruthy()
        })

        expect(screen.getByText(game.teamTwo.name)).toBeTruthy()
        expect(screen.getByText('push to cloud')).toBeTruthy()
        expect(screen.getByText('reactivate')).toBeTruthy()
    })

    it('handles push', async () => {
        const spy = jest
            .spyOn(GameNetwork, 'pushOfflineGame')
            .mockReturnValueOnce(
                Promise.resolve({
                    data: { guests: [] },
                    status: 200,
                    statusText: 'Good',
                } as AxiosResponse),
            )
        jest.spyOn(TeamNetwork, 'getManagedTeam').mockReturnValueOnce(
            Promise.resolve({
                data: { team },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )

        render(
            withRealm(
                <Provider store={store}>
                    <NavigationContainer>
                        <QueryClientProvider client={client}>
                            <OfflineGameOptionsScreen {...props} />
                        </QueryClientProvider>
                    </NavigationContainer>
                </Provider>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Team', team)
                        realm.create('Game', { ...game, offline: false })
                    })
                },
            ),
        )

        await waitFor(async () => {
            expect(screen.getByText(game.teamOne.name)).toBeTruthy()
        })

        const button = screen.getByText('push to cloud')
        fireEvent.press(button)

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('ActiveGames')
        })

        expect(spy).toHaveBeenCalled()
    })

    it('handles reactivate', async () => {
        jest.spyOn(GameNetwork, 'reenterGame').mockReturnValueOnce(
            Promise.resolve({
                data: {
                    game: { ...game, offline: true, statsPoints: [] },
                    team: 'one',
                    activePoint: undefined,
                    hasActiveActions: false,
                },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        jest.spyOn(StatsNetwork, 'getGameStats').mockResolvedValueOnce({
            data: { game: gameStats },
            status: 200,
            statusText: 'Good',
        } as AxiosResponse)

        render(
            withRealm(
                <Provider store={store}>
                    <NavigationContainer>
                        <QueryClientProvider client={client}>
                            <OfflineGameOptionsScreen {...props} />
                        </QueryClientProvider>
                    </NavigationContainer>
                </Provider>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Game', { ...game, offline: false })
                    })
                },
            ),
        )

        await waitFor(async () => {
            expect(screen.getByText(game.teamOne.name)).toBeTruthy()
        })

        fireEvent.press(screen.getByText('reactivate'))

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'FirstPoint',
                params: {
                    gameId: game._id,
                    team: 'one',
                },
            })
        })
    })
})
