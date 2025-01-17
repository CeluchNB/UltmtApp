import * as ClaimGuestRequestData from '../../src/services/data/claim-guest-request'
import * as GameData from '../../src/services/data/game'
import * as StatsData from '../../src/services/data/stats'
import * as UserData from '../../src/services/data/user'
import { DisplayTeam } from '../../src/types/team'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import { PublicUserDetailsProps } from '../../src/types/navigation'
import PublicUserScreen from '../../src/screens/PublicUserScreen'
import React from 'react'
import { User } from '../../src/types/user'
import { fetchProfileData } from '../../fixtures/data'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'

import { Game, GameStatus } from '../../src/types/game'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'
import {
    getInitialPlayerData,
    waitUntilRefreshComplete,
} from '../../fixtures/utils'

jest.mock('react-native-element-dropdown', () => {
    return {
        Dropdown: () => <span>dropdown</span>,
    }
})
jest.mock('react-native-gifted-charts', () => {
    return {
        BarChart: () => {},
        PieChart: () => {},
        __esModule: true,
    }
})

export const getGame = (team: DisplayTeam): Game => {
    return {
        _id: 'game1',
        creator: {
            _id: 'user1',
            firstName: 'First 1',
            lastName: 'Last 1',
            username: 'first1last1',
        },
        teamOne: team,
        teamTwo: { name: 'Sockeye' },
        teamTwoDefined: false,
        scoreLimit: 15,
        halfScore: 8,
        teamOneScore: 3,
        teamTwoScore: 0,
        startTime: new Date('2022-10-12'),
        softcapMins: 75,
        hardcapMins: 90,
        playersPerPoint: 7,
        resolveCode: '111111',
        timeoutPerHalf: 1,
        floaterTimeout: true,
        teamOnePlayers: [],
        teamTwoPlayers: [],
        tournament: undefined,
        totalViews: 0,
        teamOneStatus: GameStatus.ACTIVE,
        teamTwoStatus: GameStatus.GUEST,
    }
}

const navigate = jest.fn()
const addListener = jest.fn()
const setOptions = jest.fn()

const props: PublicUserDetailsProps = {
    navigation: {
        addListener,
        navigate,
        setOptions,
    } as any,
    route: {
        params: {
            user: {
                _id: 'id1',
                firstName: 'first',
                lastName: 'last',
                username: 'firstlast',
            },
        },
    } as any,
}

const client = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 0,
        },
    },
})

describe('PublicUserScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    beforeEach(() => {
        jest.spyOn(UserData, 'getPublicUser').mockResolvedValue(
            Promise.resolve({
                _id: 'id1',
                firstName: 'first',
                lastName: 'last',
                username: 'firstlast',
                email: 'firstlast@email.com',
                playerTeams: [
                    {
                        _id: 'team1',
                        place: 'place1',
                        name: 'name1',
                        teamname: 'place1name1',
                        seasonStart: '2022',
                        seasonEnd: '2022',
                    },
                    {
                        _id: 'team2',
                        place: 'place2',
                        name: 'name2',
                        teamname: 'place2name2',
                        seasonStart: '2021',
                        seasonEnd: '2021',
                    },
                ],
                requests: [],
                openToRequests: false,
                managerTeams: [],
                stats: [],
                archiveTeams: [],
                private: false,
                guest: true,
            } as User),
        )
        jest.spyOn(GameData, 'getGamesByTeam').mockImplementation(
            async (teamId: string) => {
                if (teamId === fetchProfileData.managerTeams[0]._id) {
                    return [getGame(fetchProfileData.managerTeams[0])]
                }
                return [getGame(fetchProfileData.playerTeams[0])]
            },
        )
        jest.spyOn(StatsData, 'getPlayerStats').mockResolvedValue(
            getInitialPlayerData({}),
        )
        store.dispatch(setProfile(fetchProfileData))
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <PublicUserScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        const scrollView = await snapshot.findByTestId(
            'public-user-team-scroll-view',
        )

        await waitUntilRefreshComplete(scrollView)

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should call refetch', async () => {
        const spy = jest.spyOn(UserData, 'getPublicUser')
        const { getByTestId } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <PublicUserScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        await waitUntilRefreshComplete(
            getByTestId('public-user-team-scroll-view'),
        )

        const scrollView = getByTestId('public-user-team-scroll-view')
        const { refreshControl } = scrollView.props
        await act(async () => {
            refreshControl.props.onRefresh()
        })

        expect(spy).toHaveBeenCalled()
    })

    it("should display user's teams", async () => {
        const { queryByText, getByTestId } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <PublicUserScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        await waitUntilRefreshComplete(
            getByTestId('public-user-team-scroll-view'),
        )

        expect(queryByText('@place1name1')).not.toBeNull()
        expect(queryByText('@place2name2')).not.toBeNull()
    })

    it('calls claim guest request correctly', async () => {
        jest.spyOn(
            ClaimGuestRequestData,
            'createClaimGuestRequest',
        ).mockReturnValue(Promise.resolve(undefined))

        render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <PublicUserScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        const guestBtn = screen.getByText('Is this you?')
        fireEvent.press(guestBtn)

        const requestBtn = screen.getByText('request')
        fireEvent.press(requestBtn)

        await waitFor(async () => {
            expect(screen.getByText('Success!')).toBeTruthy()
        })
    })

    it('should handle get user error', async () => {
        jest.spyOn(UserData, 'getPublicUser').mockReturnValueOnce(
            Promise.reject({
                message: 'Error getting user',
            }),
        )
        const { queryByText, getByTestId } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <PublicUserScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        await waitUntilRefreshComplete(
            getByTestId('public-user-team-scroll-view'),
        )

        await waitFor(() => {
            expect(queryByText('Error getting user')).not.toBeNull()
        })
    })
})
