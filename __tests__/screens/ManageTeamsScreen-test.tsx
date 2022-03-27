import * as AccountReducer from '../../src/store/reducers/features/account/accountReducer'
import * as RequestData from '../../src/services/data/request'
import * as UserData from '../../src/services/data/user'
import ManageTeamsScreen from '../../src/screens/ManageTeamsScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import { User } from '../../src/types/user'
import store from '../../src/store/store'
import { act, fireEvent, render } from '@testing-library/react-native'
import { fetchProfileData, requestObject } from '../../fixtures/data'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const loginData = { token: 'sample.1234.token' }

const navigate = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})

const props: Props = {
    navigation: {
        navigate,
        addListener,
    } as any,
    route: {} as any,
}

beforeAll(() => {
    jest.useFakeTimers()
})

beforeEach(async () => {
    store.dispatch(AccountReducer.setToken(loginData))
    store.dispatch(AccountReducer.setProfile(fetchProfileData))
    jest.clearAllMocks()
    jest.spyOn(RequestData, 'getRequest').mockImplementation(
        async (_token, requestId) => {
            if (requestId === 'request1') {
                return {
                    ...requestObject,
                    _id: 'request1',
                    requestSource: 'team',
                    teamDetails: {
                        _id: 'id5',
                        place: 'place5',
                        name: 'name5',
                        teamname: 'place5name5',
                        seasonStart: '2022',
                        seasonEnd: '2022',
                    },
                }
            } else if (requestId === 'request2') {
                return {
                    ...requestObject,
                    _id: 'request2',
                    requestSource: 'player',
                    teamDetails: {
                        _id: 'id6',
                        place: 'place6',
                        name: 'name6',
                        teamname: 'place6name6',
                        seasonStart: '2022',
                        seasonEnd: '2022',
                    },
                }
            }
            return requestObject
        },
    )
})

afterAll(() => {
    jest.useRealTimers()
})

it('should match snapshot', async () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should display teams correctly', async () => {
    const { queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(
        queryByText(`@${fetchProfileData.managerTeams[0].teamname}`),
    ).not.toBeNull()

    expect(
        queryByText(`@${fetchProfileData.playerTeams[0].teamname}`),
    ).not.toBeNull()

    expect(
        queryByText(`@${fetchProfileData.playerTeams[1].teamname}`),
    ).not.toBeNull()
})

it('should display error', async () => {
    jest.spyOn(RequestData, 'getRequest').mockReturnValueOnce(
        Promise.reject({}),
    )

    const { queryByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mt-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('Unable to get team details')).not.toBeNull()
})

it('should navigate to public team screen on playing team click', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const team = fetchProfileData.playerTeams[0]
    const playingTeam = getByText(`@${team.teamname}`)

    fireEvent.press(playingTeam)

    expect(navigate).toHaveBeenCalledWith('PublicTeamDetails', {
        id: team._id,
        place: team.place,
        name: team.name,
    })
})

it('should navigate to managed team screen on managing team click', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const team = fetchProfileData.managerTeams[0]
    const managingTeam = getByText(`@${team.teamname}`)

    fireEvent.press(managingTeam)

    expect(navigate).toHaveBeenCalledWith('ManagedTeamDetails', {
        id: team._id,
        place: team.place,
        name: team.name,
    })
})

it('should navigate to create team', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    fireEvent.press(getByText('create team'))

    expect(navigate).toHaveBeenCalledWith('CreateTeam')
})

it('should navigate to request team', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    fireEvent.press(getByText('request team'))

    expect(navigate).toHaveBeenCalledWith('RequestTeam')
})

it('should handle leave team', async () => {
    const leaveTeamSpy = jest
        .spyOn(UserData, 'leaveTeam')
        .mockImplementationOnce(async (_token: string, _teamId: string) => {
            const newUser: User = {
                _id: 'testid',
                firstName: 'first',
                lastName: 'last',
                email: 'test@email.com',
                username: 'testuser',
                playerTeams: [
                    {
                        _id: 'id2',
                        place: 'Place2',
                        name: 'Name2',
                        teamname: 'place2name2',
                        seasonStart: '2020',
                        seasonEnd: '2020',
                    },
                    {
                        _id: 'id3',
                        place: 'Place3',
                        name: 'Name3',
                        teamname: 'place3name3',
                        seasonStart: '2021',
                        seasonEnd: '2021',
                    },
                ],
                requests: ['request1', 'request2'],
                managerTeams: [
                    {
                        _id: 'id4',
                        place: 'Place4',
                        name: 'Name4',
                        teamname: 'place4name4',
                        seasonStart: '2022',
                        seasonEnd: '2022',
                    },
                ],
                stats: [],
                openToRequests: false,
                private: false,
            }
            return newUser
        })

    const { queryByText, getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const deleteButtons = getAllByTestId('delete-button')

    fireEvent.press(deleteButtons[0])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(
        queryByText(`@${fetchProfileData.playerTeams[0].teamname}`),
    ).toBeNull()
    expect(leaveTeamSpy).toHaveBeenCalled()
})

it('should accept request correctly', async () => {
    const requestSpy = jest
        .spyOn(RequestData, 'respondToTeamRequest')
        .mockReturnValue(Promise.resolve(requestObject))

    const { queryByText, getAllByTestId, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mt-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('@place5name5')).not.toBeNull()
    const acceptButtons = getAllByTestId('accept-button')
    fireEvent.press(acceptButtons[0])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(queryByText('@place5name5')).toBeNull()
    expect(requestSpy).toHaveBeenCalled()
})

it('should deny request correctly', async () => {
    const requestSpy = jest
        .spyOn(RequestData, 'respondToTeamRequest')
        .mockReturnValueOnce(Promise.resolve(requestObject))

    const { queryByText, getAllByTestId, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mt-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('@place5name5')).not.toBeNull()
    const deleteButtons = getAllByTestId('delete-button')
    fireEvent.press(deleteButtons[3])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(queryByText('@place5name5')).toBeNull()
    expect(requestSpy).toHaveBeenCalled()
})

it('should handle request response error correctly', async () => {
    const requestSpy = jest
        .spyOn(RequestData, 'respondToTeamRequest')
        .mockReturnValueOnce(Promise.reject({ message: 'test error message' }))

    const { queryByText, getAllByTestId, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
            ,
        </Provider>,
    )

    const scrollView = getByTestId('mt-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('@place5name5')).not.toBeNull()
    const acceptButtons = getAllByTestId('accept-button')
    fireEvent.press(acceptButtons[0])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(requestSpy).toHaveBeenCalled()
    expect(queryByText('test error message')).not.toBeNull()
    expect(queryByText('@place5name5')).not.toBeNull()
})

it('should handle successful delete request', async () => {
    const requestSpy = jest
        .spyOn(RequestData, 'deleteUserRequest')
        .mockReturnValueOnce(Promise.resolve(requestObject))

    const { queryByText, getAllByTestId, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mt-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('@place6name6')).not.toBeNull()
    const deleteButtons = getAllByTestId('delete-button')
    fireEvent.press(deleteButtons[4])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(queryByText('@place6name6')).toBeNull()
    expect(requestSpy).toHaveBeenCalled()
})

it('should handle failed delete request', async () => {
    const requestSpy = jest
        .spyOn(RequestData, 'deleteUserRequest')
        .mockReturnValueOnce(Promise.reject({}))

    const { queryByText, getAllByTestId, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mt-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('@place6name6')).not.toBeNull()
    const deleteButtons = getAllByTestId('delete-button')
    fireEvent.press(deleteButtons[4])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(queryByText('@place6name6')).not.toBeNull()
    expect(queryByText('Unable to delete request')).not.toBeNull()
    expect(requestSpy).toHaveBeenCalled()
})
