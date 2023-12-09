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
import { QueryClient, QueryClientProvider } from 'react-query'
import { fetchProfileData, game } from '../../fixtures/data'
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

const client = new QueryClient()

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
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders', async () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ActiveGamesScreen {...props} />
                    </QueryClientProvider>
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
        jest.spyOn(GameData, 'reactivateGame').mockReturnValueOnce(
            Promise.resolve({
                game: { ...game, offline: false },
                team: 'one',
                activePoint: undefined,
                hasActiveActions: false,
            }),
        )
        jest.spyOn(PointData, 'getActivePointForGame').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ActiveGamesScreen {...props} />
                    </QueryClientProvider>
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

    it('deletes a game', async () => {
        const spy = jest
            .spyOn(GameData, 'deleteGame')
            .mockReturnValueOnce(Promise.resolve(undefined))
        const { getByText, getAllByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ActiveGamesScreen {...props} />
                    </QueryClientProvider>
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
