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
import { setToken } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const goBack = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})

const token = '123.1234.gfads23'
let getManagedTeamResponse: Team
let requestObject: DetailedRequest

const props: ManagedTeamDetailsProps = {
    navigation: {
        addListener,
        navigate,
        goBack,
    } as any,
    route: {
        params: {
            id: 'id1',
            place: 'place',
            name: 'name',
        },
    } as any,
}

beforeAll(() => {
    store.dispatch(setToken(token))
    jest.useFakeTimers()
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
        async (_token, requestId) => {
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
})

afterAll(() => {
    jest.useRealTimers()
})

it('should match snapshot', async () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should navigate to rollover a team with no pending requests', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Start New Season')

    fireEvent.press(button)

    expect(navigate).toHaveBeenCalledWith('RolloverTeam', {
        hasPendingRequests: false,
    })
})

it('should navigate to rollover a team with pending requests', async () => {
    const { getByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    const button = getByText('Start New Season')

    fireEvent.press(button)

    expect(navigate).toHaveBeenCalledWith('RolloverTeam', {
        hasPendingRequests: true,
    })
})

// it('should toggle roster status', async () => {
//     const dataFn = jest
//         .fn()
//         .mockImplementationOnce(async (_token, id, open) => {
//             return { rosterOpen: open } as Team
//         })
//     const spy = jest.spyOn(ManagedTeamReducer, 'toggleRosterStatus')

//     jest.spyOn(TeamData, 'toggleRosterStatus').mockImplementationOnce(dataFn)

//     const { getByText, queryByText } = render(
//         <Provider store={store}>
//             <NavigationContainer>
//                 <ManageTeamDetailsScreen {...props} />
//             </NavigationContainer>
//         </Provider>,
//     )

//     const button = getByText('Open Roster')
//     fireEvent.press(button)

//     waitFor(() => queryByText('Close Roster'))
//     expect(spy).toHaveBeenCalledTimes(1)
//     expect(dataFn).toHaveBeenCalledTimes(1)
// })

it('should handle swipe to refresh', async () => {
    const teamSpy = jest.spyOn(TeamData, 'getManagedTeam')

    const { getByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    // expect getManagedTeam to be called
    expect(teamSpy).toHaveBeenCalled()

    // check data is passed and displayed correctly
    const teamname = getByText('@placename')
    expect(teamname).toBeTruthy()

    // player displayed correctly
    const player = getByText('@first1last1')
    expect(player).toBeTruthy()

    // test team request displayed correctly
    const teamRequest = getByText('@first2last2')
    expect(teamRequest).toBeTruthy()

    // test player request displayed correctly
    const playerRequest = getByText('@first3last3')
    expect(playerRequest).toBeTruthy()
})

it('should handle a page load error', async () => {
    jest.spyOn(TeamData, 'getManagedTeam').mockReturnValueOnce(
        Promise.reject({ message: 'test error' }),
    )

    const { getByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        await refreshControl.props.onRefresh()
    })

    const errorText = getByText('test error')
    expect(errorText).toBeTruthy()
})

it('should not throw error on unmounted load', async () => {
    const requestSpy = jest.spyOn(RequestData, 'getRequest')
    const teamSpy = jest.spyOn(TeamData, 'getManagedTeam')

    const { getByTestId, unmount } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    unmount()
    await act(async () => {
        await refreshControl.props.onRefresh()
    })

    expect(teamSpy).not.toHaveBeenCalled()
    expect(requestSpy).not.toHaveBeenCalled()
})

it('should respond to request correctly', async () => {
    const responseSpy = jest
        .spyOn(RequestData, 'respondToPlayerRequest')
        .mockReturnValueOnce(
            Promise.resolve({
                ...requestObject,
                requestSource: 'player',
                userDetails: {
                    _id: 'playerid3',
                    firstName: 'first3',
                    lastName: 'last3',
                    username: 'first3last3',
                },
            }),
        )

    const { getByTestId, getAllByTestId, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    const acceptButtons = getAllByTestId('accept-button')
    expect(queryByText('@first3last3')).not.toBeNull()
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
    fireEvent.press(acceptButtons[0])
    await act(async () => {})

    expect(queryByText('@first3last3')).toBeNull()
    expect(responseSpy).toHaveBeenCalledWith(token, 'request2', true)
})

it('should handle respond to request error', async () => {
    jest.spyOn(RequestData, 'respondToPlayerRequest').mockReturnValueOnce(
        Promise.reject({
            message: 'respond test error',
        }),
    )

    const { queryByText, getByTestId, getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    const acceptButtons = getAllByTestId('accept-button')
    fireEvent.press(acceptButtons[0])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    const errorText = queryByText('respond test error')
    expect(errorText).not.toBeNull()
})

it('should handle deny request', async () => {
    const responseSpy = jest
        .spyOn(RequestData, 'respondToPlayerRequest')
        .mockReturnValueOnce(
            Promise.resolve({
                ...requestObject,
                requestSource: 'player',
                userDetails: {
                    _id: 'playerid3',
                    firstName: 'first3',
                    lastName: 'last3',
                    username: 'first3last3',
                },
            }),
        )

    const { queryByText, getByTestId, getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    const deleteButtons = getAllByTestId('delete-button')
    fireEvent.press(deleteButtons[1])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(queryByText('@first3last3')).toBeNull()

    expect(responseSpy).toHaveBeenCalledWith(token, 'request2', false)
})

it('should remove player correctly', async () => {
    const removeSpy = jest
        .spyOn(TeamData, 'removePlayer')
        .mockImplementationOnce(async () => {
            getManagedTeamResponse.players = []
            return getManagedTeamResponse
        })

    const { queryByText, getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const username = '@first1last1'
    expect(queryByText(username)).not.toBeNull()
    const deleteButtons = getAllByTestId('delete-button')
    fireEvent.press(deleteButtons[0])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(removeSpy).toHaveBeenCalled()
    expect(queryByText(username)).toBeNull()
})

it('should handle delete request correctly', async () => {
    const deleteSpy = jest
        .spyOn(RequestData, 'deleteTeamRequest')
        .mockImplementationOnce(async () => {
            return requestObject
        })

    const { queryByText, getByTestId, getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )
    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    const username = '@first2last2'
    expect(queryByText(username)).not.toBeNull()
    const deleteButtons = getAllByTestId('delete-button')
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    fireEvent.press(deleteButtons[2])
    await act(async () => {})

    expect(deleteSpy).toHaveBeenCalled()
    expect(queryByText(username)).toBeNull()
})

it('should handle delete request error correctly', async () => {
    jest.spyOn(RequestData, 'deleteTeamRequest').mockReturnValueOnce(
        Promise.reject({
            message: 'delete error message',
        }),
    )

    const { queryByText, getByTestId, getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )
    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    const username = '@first2last2'
    expect(queryByText(username)).not.toBeNull()
    const deleteButtons = getAllByTestId('delete-button')
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    fireEvent.press(deleteButtons[2])
    await act(async () => {})

    expect(queryByText(username)).not.toBeNull()
    expect(queryByText('delete error message')).not.toBeNull()
})

it('should handle error swipe', async () => {
    jest.spyOn(TeamData, 'getManagedTeam').mockClear()
    jest.spyOn(TeamData, 'getManagedTeam')
        .mockReturnValueOnce(
            Promise.reject({ message: 'test error getting team' }),
        )
        .mockReturnValue(Promise.resolve(getManagedTeamResponse))

    const { queryByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )
    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('test error getting team')).not.toBeNull()

    const scrollViewError = getByTestId('mtd-flat-list')
    const { refreshControl: refreshControlError } = scrollViewError.props
    await act(async () => {
        refreshControlError.props.onRefresh()
    })

    expect(queryByText('@placename')).toBeNull()
})

it('should navigate to public user', async () => {
    const { getByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )
    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    const username = getByText('@first1last1')
    fireEvent.press(username)

    expect(navigate).toHaveBeenCalled()
})

it('should handle add players text', async () => {
    const { getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const buttons = getAllByTestId('create-button')
    fireEvent.press(buttons[1])

    expect(navigate).toHaveBeenCalled()
})

it('should navigate to public user screen on manager click', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('@first4last4')
    fireEvent.press(button)

    expect(navigate).toHaveBeenCalled()
})

it('should navigate to request manager screen', async () => {
    const { getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const buttons = getAllByTestId('create-button')
    fireEvent.press(buttons[0])

    expect(navigate).toHaveBeenCalled()
})
