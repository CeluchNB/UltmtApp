import * as GameData from '../../src/services/data/game'
import * as PointData from '../../src/services/data/point'
import * as UserData from '../../src/services/data/user'
import { ActiveGamesProps } from '../../src/types/navigation'
import ActiveGamesScreen from '../../src/screens/ActiveGamesScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../src/store/store'
import { Game, LocalGame } from '../../src/types/game'
import { fetchProfileData, game, point } from '../../fixtures/data'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

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

const createGame = (overrides: Partial<Game>): LocalGame => {
    return {
        ...game,
        offline: false,
        ...overrides,
    }
}

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

beforeEach(() => {
    jest.resetAllMocks()
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
    jest.spyOn(UserData, 'getUserId').mockReturnValue(
        Promise.resolve(fetchProfileData._id),
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
                screen.getByText(
                    `${game.teamOne.name} vs. ${game.teamTwo.name}`,
                ),
            ).toBeTruthy()
        })

        expect(screen.getByText(`vs. ${game.teamTwo.name}`)).toBeTruthy()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('navigates without a point', async () => {
        jest.spyOn(GameData, 'resurrectActiveGame').mockReturnValueOnce(
            Promise.resolve({
                ...game,
                tournament: undefined,
                startTime: '2022',
                offline: false,
            } as unknown as Game & { offline: boolean }),
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
                getByText(`${game.teamOne.name} vs. ${game.teamTwo.name}`),
            ).toBeTruthy()
        })

        fireEvent.press(
            getByText(`${game.teamOne.name} vs. ${game.teamTwo.name}`),
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
                offline: false,
            } as unknown as LocalGame),
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
                getByText(`${game.teamOne.name} vs. ${game.teamTwo.name}`),
            ).toBeTruthy()
        })

        fireEvent.press(
            getByText(`${game.teamOne.name} vs. ${game.teamTwo.name}`),
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
                offline: false,
            } as unknown as LocalGame),
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
                getByText(`${game.teamOne.name} vs. ${game.teamTwo.name}`),
            ).toBeTruthy()
        })

        fireEvent.press(
            getByText(`${game.teamOne.name} vs. ${game.teamTwo.name}`),
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
                offline: false,
            } as unknown as LocalGame),
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
                getByText(`${game.teamOne.name} vs. ${game.teamTwo.name}`),
            ).toBeTruthy()
        })

        fireEvent.press(
            getByText(`${game.teamOne.name} vs. ${game.teamTwo.name}`),
        )

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'LivePointEdit',
            })
        })
    })

    it('deletes a game', async () => {
        const spy = jest
            .spyOn(GameData, 'deleteGame')
            .mockReturnValueOnce(Promise.resolve(undefined))
        const { getByText, getAllByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ActiveGamesScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        await waitFor(async () => {
            expect(
                getByText(`${game.teamOne.name} vs. ${game.teamTwo.name}`),
            ).toBeTruthy()
        })

        const deleteBtn1 = getAllByTestId('delete-button')[0]
        fireEvent.press(deleteBtn1)

        const confirmBtn = getByText('confirm')
        fireEvent.press(confirmBtn)

        expect(spy).toHaveBeenCalledTimes(1)

        const deleteBtn2 = getAllByTestId('delete-button')[0]
        fireEvent.press(deleteBtn2)

        const cancelBtn = getByText('cancel')
        fireEvent.press(cancelBtn)

        expect(spy).toHaveBeenCalledTimes(1)
    })
})
