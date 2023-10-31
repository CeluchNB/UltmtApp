import * as ManagedTeamReducer from '../../src/store/reducers/features/team/managedTeamReducer'
import * as RequestData from '../../src/services/data/request'
import * as TeamData from '../../src/services/data/team'
import { DetailedRequest } from '../../src/types/request'
import ManageTeamDetailsScreen from '../../src/screens/ManageTeamDetailsScreen'
import { ManagedTeamDetailsProps } from '../../src/types/navigation'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { Team } from '../../src/types/team'
import { setTeam } from '../../src/store/reducers/features/team/managedTeamReducer'
import store from '../../src/store/store'
import { waitUntilRefreshComplete } from '../../fixtures/utils'
import { QueryClient, QueryClientProvider } from 'react-query'
import { act, fireEvent, render, screen } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const goBack = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})
const setOptions = jest.fn()

let getManagedTeamResponse: Team
let requestObject: DetailedRequest

const props: ManagedTeamDetailsProps = {
    navigation: {
        addListener,
        navigate,
        goBack,
        setOptions,
    } as any,
    route: {
        params: {
            id: 'id1',
            place: 'place',
            name: 'name',
        },
    } as any,
}

const client = new QueryClient({
    defaultOptions: {
        queries: { retry: 0 },
    },
})

beforeEach(() => {
    jest.clearAllMocks()
    getManagedTeamResponse = {
        _id: 'id1',
        place: 'place',
        name: 'name',
        teamname: 'placename',
        players: [
            {
                _id: 'playerid1',
                firstName: 'first1',
                lastName: 'last1',
                username: 'first1last1',
            },
        ],
        requests: ['request1', 'request2'],
        managers: [
            {
                _id: 'playerid4',
                firstName: 'first4',
                lastName: 'last4',
                username: 'first4last4',
            },
        ],
        seasonNumber: 1,
        seasonStart: '2022',
        seasonEnd: '2022',
        continuationId: 'id1234',
        rosterOpen: false,
        games: [],
    }
    requestObject = {
        _id: 'request1',
        team: 'id1',
        user: 'playerid1',
        requestSource: 'team',
        teamDetails: {
            _id: 'id1',
            place: 'place',
            name: 'name',
            teamname: 'placename',
            seasonStart: '2022',
            seasonEnd: '2022',
        },
        userDetails: {
            _id: 'playerid1',
            firstName: 'first1',
            lastName: 'last1',
            username: 'first1last1',
        },
        status: 'pending',
    }
    jest.spyOn(RequestData, 'getRequest').mockImplementation(
        async requestId => {
            if (requestId === 'request1') {
                return {
                    ...requestObject,
                    _id: 'request1',
                    requestSource: 'team',
                    userDetails: {
                        _id: 'playerid2',
                        firstName: 'first2',
                        lastName: 'last2',
                        username: 'first2last2',
                    },
                }
            } else if (requestId === 'request2') {
                return {
                    ...requestObject,
                    _id: 'request2',
                    requestSource: 'player',
                    userDetails: {
                        _id: 'playerid3',
                        firstName: 'first3',
                        lastName: 'last3',
                        username: 'first3last3',
                    },
                }
            }
            return requestObject
        },
    )
    jest.spyOn(TeamData, 'getManagedTeam').mockReturnValue(
        Promise.resolve(getManagedTeamResponse),
    )
    store.dispatch(setTeam(getManagedTeamResponse))
})

describe('ManageTeamDetailsScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(snapshot.getByTestId('mtd-flat-list'))

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should navigate to rollover a team with pending requests', async () => {
        const { getByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

        const button = getByText('Rollover Team')

        fireEvent.press(button)

        expect(navigate).toHaveBeenCalledWith('RolloverTeam')
    })

    it('should handle swipe to refresh', async () => {
        const teamSpy = jest.spyOn(TeamData, 'getManagedTeam')

        const { getByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

        // expect getManagedTeam to be called
        expect(teamSpy).toHaveBeenCalled()

        // check data is passed and displayed correctly
        const teamname = getByText('@placename')
        expect(teamname).toBeTruthy()

        // player displayed correctly
        const player = getByText('@first1last1')
        expect(player).toBeTruthy()
    })

    it('should handle a page load error', async () => {
        jest.spyOn(TeamData, 'getManagedTeam').mockReturnValueOnce(
            Promise.reject({ message: 'test error' }),
        )

        const { getByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

        const errorText = getByText('test error')
        expect(errorText).toBeTruthy()
    })

    it('should remove player correctly', async () => {
        const removeSpy = jest
            .spyOn(TeamData, 'removePlayer')
            .mockImplementationOnce(async () => {
                return { ...getManagedTeamResponse, players: [] }
            })

        const { queryByText, getAllByTestId, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

        const username = '@first1last1'
        expect(queryByText(username)).not.toBeNull()
        const deleteButtons = getAllByTestId('delete-button')
        fireEvent.press(deleteButtons[0])
        /*
        Should not need act() after fireEvent, however test fails if it's not there.
        The alternative, preferred method of

        fireEvent.press(acceptButtons[0])
        await waitFor(() => queryByText('@first3last3'))

        gives an error of:
        You called act(async () => ...) without await...

        Explore fix in the future
        Another option is wrapping fireEvent in act, but
        this makes it more obvious something weird is going on
    */
        await act(async () => {})

        expect(removeSpy).toHaveBeenCalled()
        expect(queryByText(username)).toBeNull()
    })

    it('should handle error swipe', async () => {
        jest.spyOn(TeamData, 'getManagedTeam').mockClear()
        const spy = jest
            .spyOn(TeamData, 'getManagedTeam')
            .mockReturnValue(
                Promise.reject({ message: 'test error getting team' }),
            )

        const { queryByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

        expect(queryByText('test error getting team')).not.toBeNull()

        const scrollViewError = getByTestId('mtd-flat-list')
        const { refreshControl: refreshControlError } = scrollViewError.props
        await act(async () => {
            refreshControlError.props.onRefresh()
        })

        expect(spy).toHaveBeenCalled()
    })

    it('should navigate to public user', async () => {
        const { getByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

        const username = getByText('@first1last1')
        fireEvent.press(username)

        expect(navigate).toHaveBeenCalled()
    })

    it('should handle add players text', async () => {
        const { getAllByTestId, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

        const buttons = getAllByTestId('create-button')
        fireEvent.press(buttons[1])

        expect(navigate).toHaveBeenCalled()
    })

    it('should navigate to public user screen on manager click', async () => {
        const { getByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

        const button = getByText('@first4last4')
        fireEvent.press(button)

        expect(navigate).toHaveBeenCalled()
    })

    it('should navigate to request manager screen', async () => {
        const { getAllByTestId, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

        const buttons = getAllByTestId('create-button')
        fireEvent.press(buttons[0])

        expect(navigate).toHaveBeenCalled()
    })

    it('should toggle roster status', async () => {
        const dataFn = jest
            .fn()
            .mockImplementationOnce(async (_token, id, open) => {
                return { rosterOpen: open } as Team
            })
        const spy = jest.spyOn(ManagedTeamReducer, 'toggleRosterStatus')

        jest.spyOn(TeamData, 'toggleRosterStatus').mockImplementationOnce(
            dataFn,
        )
        render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <ManageTeamDetailsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        const toggleSwitch = screen.getByTestId('roster-open-switch')
        fireEvent(toggleSwitch, 'valueChange')

        expect(spy).toHaveBeenCalled()
    })
})
