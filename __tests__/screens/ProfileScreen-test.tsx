import * as AuthData from '../../src/services/data/auth'
import * as GameData from '../../src/services/data/game'
import * as StatsData from '../../src/services/data/stats'
import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { ProfileProps } from '../../src/types/navigation'
import ProfileScreen from '../../src/screens/ProfileScreen'
import { Provider } from 'react-redux'
import React from 'react'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'
import { fetchProfileData, game } from '../../fixtures/data'
import {
    getInitialPlayerData,
    waitUntilRefreshComplete,
} from '../../fixtures/utils'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const addListener = jest.fn()

const client = new QueryClient()

const props: ProfileProps = {
    navigation: {
        navigate,
        addListener,
    } as any,
    route: {} as any,
}

beforeAll(async () => {
    jest.useFakeTimers({ legacyFakeTimers: true })
    jest.spyOn(AuthData, 'login').mockImplementation(
        async (_username: string, _password: string) => {
            return
        },
    )

    jest.spyOn(UserData, 'fetchProfile').mockImplementation(async () => {
        return { ...fetchProfileData, managerTeams: [game.teamOne] }
    })
    jest.spyOn(GameData, 'getGamesByTeam').mockReturnValue(
        Promise.resolve([game]),
    )
    jest.spyOn(GameData, 'getActiveGames').mockReturnValue(
        Promise.resolve([{ ...game, offline: false }]),
    )
    jest.spyOn(StatsData, 'getPlayerStats').mockReturnValue(
        Promise.resolve(
            getInitialPlayerData({
                goals: 1,
                assists: 1,
                plusMinus: 2,
                blocks: 1,
            }),
        ),
    )
    store.dispatch(
        setProfile({ ...fetchProfileData, managerTeams: [game.teamOne] }),
    )
})

afterAll(() => {
    jest.useRealTimers()
})

beforeEach(() => {
    navigate.mockReset()
    addListener.mockReset()
})

describe('ProfileScreen', () => {
    it('profile screen matches snapshot', async () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ProfileScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(
            snapshot.getByTestId('profile-flat-list'),
        )
        // await waitFor(async () => {
        //     expect(
        //         snapshot.getByText(
        //             `${game.teamOneScore} - ${game.teamTwoScore}`,
        //         ),
        //     ).toBeTruthy()
        // })

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('contains correct text from response', async () => {
        const { getByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ProfileScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )
        await waitUntilRefreshComplete(getByTestId('profile-flat-list'))

        await act(async () => {
            const title = getByText(
                `${fetchProfileData.firstName} ${fetchProfileData.lastName}`,
            )
            expect(title).toBeTruthy()

            const username = getByText(`@${fetchProfileData.username}`)
            expect(username).toBeTruthy()

            const team1 = getByText(
                `${game.teamOne.place} ${game.teamOne.name}`,
            )
            expect(team1).toBeTruthy()

            const team2 = getByText(
                `${fetchProfileData.playerTeams[0].place} ${fetchProfileData.playerTeams[0].name}`,
            )
            expect(team2).toBeTruthy()

            const team3 = getByText(
                `${fetchProfileData.playerTeams[1].place} ${fetchProfileData.playerTeams[1].name}`,
            )
            expect(team3).toBeTruthy()
        })
    })

    it('handles player team click functionality', async () => {
        render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ProfileScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        const team1 = screen.getByText(
            `${game.teamOne.place} ${game.teamOne.name}`,
        )
        fireEvent.press(team1)
        expect(navigate).toHaveBeenCalledWith('ManagedTeamDetails', {
            id: game.teamOne._id,
        })

        const team2 = screen.getByText(
            `${fetchProfileData.playerTeams[0].place} ${fetchProfileData.playerTeams[0].name}`,
        )
        fireEvent.press(team2)
        expect(navigate).toHaveBeenCalledWith('PublicTeamDetails', {
            id: fetchProfileData.playerTeams[0]._id,
        })
    })

    it('should handle logout click', async () => {
        jest.spyOn(AuthData, 'logout').mockReturnValueOnce(Promise.resolve())
        const { getByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ProfileScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('profile-flat-list'))

        const button = getByText('Sign Out')
        fireEvent.press(button)
        // should not need this
        await act(async () => {})

        expect(navigate).toHaveBeenCalledTimes(1)
    })

    it('should handle manage teams click', async () => {
        const { getByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ProfileScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('profile-flat-list'))

        const button = getByText('manage teams')
        fireEvent.press(button)
        expect(navigate).toHaveBeenCalledTimes(1)
    })

    it('should handle player team click', async () => {
        const { getByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ProfileScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('profile-flat-list'))

        const team = getByText(
            `${fetchProfileData.playerTeams[0].place} ${fetchProfileData.playerTeams[0].name}`,
        )
        fireEvent.press(team)
        expect(navigate).toHaveBeenCalledTimes(1)
    })

    it('should handle create team click', async () => {
        const { getAllByTestId, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ProfileScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('profile-flat-list'))

        const buttons = getAllByTestId('create-button')
        fireEvent.press(buttons[1])
        expect(navigate).toHaveBeenCalledTimes(1)
    })

    it('should handle swipe functionality', async () => {
        const mockFn = jest.fn()
        const spy = jest
            .spyOn(UserData, 'fetchProfile')
            .mockImplementation(mockFn)

        const { getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ProfileScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )
        await waitUntilRefreshComplete(getByTestId('profile-flat-list'))

        // refactor once it is possible to fire swipe event
        const scrollView = getByTestId('profile-flat-list')
        const { refreshControl } = scrollView.props
        await act(async () => {
            refreshControl.props.onRefresh()
        })

        expect(mockFn).toHaveBeenCalled()
        spy.mockRestore()
    })
})
