import * as AuthData from '../../../src/services/data/auth'
import * as Constants from '../../../src/utils/constants'
import * as TeamData from '../../../src/services/data/team'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { SelectMyTeamProps } from '../../../src/types/navigation'
import SelectMyTeamScreen from '../../../src/screens/games/SelectMyTeamScreen'
import store from '../../../src/store/store'
import {
    CreateGameContext,
    CreateGameContextData,
} from '../../../src/context/create-game-context'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react-native'

const client = new QueryClient()
const navigate = jest.fn()
const addListener = jest.fn()
const reset = jest.fn()

const props: SelectMyTeamProps = {
    navigation: {
        navigate,
        addListener,
        reset,
    } as any,
    route: {} as any,
}

describe('SelectMyTeamScreen', () => {
    afterEach(() => {
        jest.resetAllMocks()
        client.clear()
    })

    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('should match snapshot with unauthenticated user', async () => {
        jest.spyOn(TeamData, 'getManagingTeams').mockReturnValueOnce(
            Promise.resolve([]),
        )
        jest.spyOn(AuthData, 'isLoggedIn').mockReturnValueOnce(
            Promise.resolve(false),
        )

        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <SelectMyTeamScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitForElementToBeRemoved(() =>
            snapshot.getByTestId('select-team-loading'),
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
        expect(snapshot.getByText(Constants.AUTH_TO_CREATE)).toBeTruthy()
        fireEvent.press(snapshot.getByText('log in'))
        expect(navigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Account',
            params: { screen: 'Login' },
        })
    })

    it('should match snapshot without manager teams', async () => {
        jest.spyOn(AuthData, 'isLoggedIn').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(TeamData, 'getManagingTeams').mockReturnValueOnce(
            Promise.resolve([]),
        )

        render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <SelectMyTeamScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitForElementToBeRemoved(() =>
            screen.getByTestId('select-team-loading'),
        )

        expect(screen.toJSON()).toMatchSnapshot()
        expect(screen.getByText(Constants.MANAGE_TO_CREATE)).not.toBeNull()
        fireEvent.press(screen.getByText('create team'))
        expect(navigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Account',
            params: { screen: 'CreateTeam' },
        })
    })

    it('should match snapshot with manager teams', async () => {
        jest.spyOn(AuthData, 'isLoggedIn').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(TeamData, 'getManagingTeams').mockReturnValueOnce(
            Promise.resolve([
                {
                    _id: 'team1',
                    place: 'Place',
                    name: 'Name',
                    teamname: 'place1name1',
                    seasonStart: '2022',
                    seasonEnd: '2022',
                    managers: [],
                    players: [],
                    seasonNumber: 1,
                    continuationId: 'team1',
                    rosterOpen: true,
                    requests: [],
                    games: [],
                },
            ]),
        )

        render(
            <Provider store={store}>
                <CreateGameContext.Provider
                    value={
                        {
                            setActiveTeam: jest.fn(),
                        } as unknown as CreateGameContextData
                    }>
                    <NavigationContainer>
                        <QueryClientProvider client={client}>
                            <SelectMyTeamScreen {...props} />
                        </QueryClientProvider>
                    </NavigationContainer>
                </CreateGameContext.Provider>
            </Provider>,
        )

        await waitForElementToBeRemoved(() =>
            screen.getByTestId('select-team-loading'),
        )

        expect(screen.toJSON()).toMatchSnapshot()
        expect(screen.getByText('@place1name1')).not.toBeNull()
        fireEvent.press(screen.getByText('@place1name1'))
        await waitFor(async () => {
            expect(reset).toHaveBeenCalledWith({
                index: 1,
                routes: [
                    { name: 'Tabs' },
                    { name: 'SelectOpponent', params: {} },
                ],
            })
        })
    })
})
