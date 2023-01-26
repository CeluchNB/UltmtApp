import * as GameData from '../../src/services/data/game'
import * as PointData from '../../src/services/data/point'
import { ActiveGamesProps } from '../../src/types/navigation'
import ActiveGamesScreen from '../../src/screens/ActiveGamesScreen'
import { Game } from '../../src/types/game'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { fetchProfileData, game, point } from '../../fixtures/data'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

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

const props: ActiveGamesProps = {
    navigation: {
        mockedNavigate,
        addListener: jest.fn(),
    } as any,
    route: {} as any,
}

beforeEach(() => {
    jest.resetAllMocks()
    store.dispatch(setProfile(fetchProfileData))
    jest.spyOn(GameData, 'getActiveGames').mockReturnValue(
        Promise.resolve([
            createGame({
                creator: {
                    _id: fetchProfileData._id,
                    firstName: fetchProfileData.firstName,
                    lastName: fetchProfileData.lastName,
                    username: fetchProfileData.username,
                },
            }),
            createGame({
                creator: {
                    _id: 'otheruser',
                    firstName: fetchProfileData.firstName,
                    lastName: fetchProfileData.lastName,
                    username: fetchProfileData.username,
                },
            }),
        ]),
    )
})

describe('ActiveGamesScreen', () => {
    it('renders', async () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ActiveGamesScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        await waitFor(async () => {
            expect(
                snapshot.getByText(
                    `vs. ${game.teamOne.place} ${game.teamOne.name}`,
                ),
            ).toBeTruthy()
        })

        expect(snapshot.getByText(`vs. ${game.teamTwo.name}`)).toBeTruthy()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('navigates without a point', async () => {
        jest.spyOn(GameData, 'resurrectActiveGame').mockReturnValueOnce(
            Promise.resolve({
                ...game,
                tournament: undefined,
                startTime: '2022',
            } as unknown as Game),
        )
        jest.spyOn(PointData, 'getActivePointForGame').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ActiveGamesScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )
        await waitFor(async () => {
            expect(
                getByText(`vs. ${game.teamOne.place} ${game.teamOne.name}`),
            ).toBeTruthy()
        })

        fireEvent.press(
            getByText(`vs. ${game.teamOne.place} ${game.teamOne.name}`),
        )

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'FirstPoint',
            })
        })
    })

    it('navigating with team one and no actions', async () => {
        jest.spyOn(GameData, 'resurrectActiveGame').mockReturnValueOnce(
            Promise.resolve({
                ...game,
                creator: {
                    _id: fetchProfileData._id,
                    firstName: fetchProfileData.firstName,
                    lastName: fetchProfileData.lastName,
                    username: fetchProfileData.username,
                },
                tournament: undefined,
                startTime: '2022',
            } as unknown as Game),
        )
        jest.spyOn(PointData, 'getActivePointForGame').mockReturnValueOnce(
            Promise.resolve(point),
        )
        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ActiveGamesScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )
        await waitFor(async () => {
            expect(
                getByText(`vs. ${game.teamOne.place} ${game.teamOne.name}`),
            ).toBeTruthy()
        })

        fireEvent.press(
            getByText(`vs. ${game.teamOne.place} ${game.teamOne.name}`),
        )

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'SelectPlayers',
            })
        })
    })

    it('navigating with team two and no actions', async () => {
        jest.spyOn(GameData, 'resurrectActiveGame').mockReturnValueOnce(
            Promise.resolve({
                ...game,
                creator: {
                    _id: 'nonuserid',
                    firstName: fetchProfileData.firstName,
                    lastName: fetchProfileData.lastName,
                    username: fetchProfileData.username,
                },
                tournament: undefined,
                startTime: '2022',
            } as unknown as Game),
        )
        jest.spyOn(PointData, 'getActivePointForGame').mockReturnValueOnce(
            Promise.resolve(point),
        )
        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ActiveGamesScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )
        await waitFor(async () => {
            expect(
                getByText(`vs. ${game.teamOne.place} ${game.teamOne.name}`),
            ).toBeTruthy()
        })

        fireEvent.press(
            getByText(`vs. ${game.teamOne.place} ${game.teamOne.name}`),
        )

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'SelectPlayers',
            })
        })
    })

    it('with actions', async () => {
        jest.spyOn(GameData, 'resurrectActiveGame').mockReturnValueOnce(
            Promise.resolve({
                ...game,
                creator: {
                    _id: fetchProfileData._id,
                    firstName: fetchProfileData.firstName,
                    lastName: fetchProfileData.lastName,
                    username: fetchProfileData.username,
                },
                tournament: undefined,
                startTime: '2022',
            } as unknown as Game),
        )
        jest.spyOn(PointData, 'getActivePointForGame').mockReturnValueOnce(
            Promise.resolve({ ...point, teamOneActions: ['an action'] }),
        )
        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ActiveGamesScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )
        await waitFor(async () => {
            expect(
                getByText(`vs. ${game.teamOne.place} ${game.teamOne.name}`),
            ).toBeTruthy()
        })

        fireEvent.press(
            getByText(`vs. ${game.teamOne.place} ${game.teamOne.name}`),
        )

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'LivePointEdit',
            })
        })
    })
})
