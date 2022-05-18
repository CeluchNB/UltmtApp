import * as RequestData from '../../src/services/data/request'
import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import UserRequestsScreen from '../../src/screens/UserRequestsScreen'
import store from '../../src/store/store'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { fetchProfileData, requestObject } from '../../fixtures/data'
import {
    setProfile,
    setToken,
} from '../../src/store/reducers/features/account/accountReducer'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})
const token = 'token.1234.token'

const props: Props = {
    navigation: {
        navigate,
        addListener,
    } as any,
    route: {} as any,
}

beforeEach(() => {
    store.dispatch(setProfile(fetchProfileData))
    store.dispatch(setToken(token))
    jest.clearAllMocks()
    jest.spyOn(RequestData, 'getRequestsByUser').mockReturnValue(
        Promise.resolve([
            {
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
            },
            {
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
            },
        ]),
    )
})

it('should match snapshot', async () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <UserRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should handle toggle roster status click', async () => {
    const spy = jest
        .spyOn(UserData, 'setOpenToRequests')
        .mockReturnValueOnce(
            Promise.resolve({ ...fetchProfileData, openToRequests: false }),
        )
    const { getByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <UserRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )
    fireEvent.press(getByText('allow requests'))
    await waitFor(() => queryByText('prevent requests'))
    expect(spy).toHaveBeenCalledWith(token, true)
})

it('should handle navigate to request team page', async () => {
    const { getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <UserRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    fireEvent.press(getByTestId('create-button'))
    expect(navigate).toHaveBeenCalledWith('RequestTeam')
})

it('should handle fetch requests error', async () => {
    const spy = jest
        .spyOn(RequestData, 'getRequestsByUser')
        .mockReturnValueOnce(Promise.reject({}))

    const { queryByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <UserRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mt-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('Unable to get request details')).not.toBeNull()
    expect(spy).toHaveBeenCalled()
})

it('should handle fetch after error', async () => {
    const spy = jest
        .spyOn(RequestData, 'getRequestsByUser')
        .mockReturnValueOnce(Promise.reject({}))

    const { queryByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <UserRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mt-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('Unable to get request details')).not.toBeNull()
    expect(spy).toHaveBeenCalledTimes(1)

    const errorScrollView = getByTestId('mt-scroll-view')
    const { refreshControl: errorRefreshControl } = errorScrollView.props
    await act(async () => {
        errorRefreshControl.props.onRefresh()
    })

    expect(spy).toHaveBeenCalledTimes(2)
    expect(queryByText('@place5name5')).not.toBeNull()
})

it('should accept request correctly', async () => {
    const requestSpy = jest
        .spyOn(RequestData, 'respondToTeamRequest')
        .mockReturnValue(Promise.resolve(requestObject))

    const { queryByText, getAllByTestId, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <UserRequestsScreen {...props} />
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
                <UserRequestsScreen {...props} />
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
    fireEvent.press(deleteButtons[0])
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
                <UserRequestsScreen {...props} />
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
                <UserRequestsScreen {...props} />
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
    fireEvent.press(deleteButtons[1])
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
                <UserRequestsScreen {...props} />
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
    fireEvent.press(deleteButtons[1])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(queryByText('@place6name6')).not.toBeNull()
    expect(queryByText('Unable to delete request')).not.toBeNull()
    expect(requestSpy).toHaveBeenCalled()
})
