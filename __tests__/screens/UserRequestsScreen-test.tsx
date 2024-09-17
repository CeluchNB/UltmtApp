import * as Constants from '../../src/utils/constants'
import * as RequestData from '../../src/services/data/request'
import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { UserRequestProps } from '../../src/types/navigation'
import UserRequestsScreen from '../../src/screens/UserRequestsScreen'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { waitUntilRefreshComplete } from '../../fixtures/utils'
import { QueryClient, QueryClientProvider } from 'react-query'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import { fetchProfileData, requestObject } from '../../fixtures/data'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})

const props: UserRequestProps = {
    navigation: {
        navigate,
        addListener,
    } as any,
    route: {} as any,
}

beforeEach(() => {
    store.dispatch(setProfile(fetchProfileData))
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

const client = new QueryClient({
    defaultOptions: {
        queries: { retry: 0 },
    },
})

describe('UserRequestsScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )
        await waitUntilRefreshComplete(snapshot.getByTestId('mt-scroll-view'))

        expect(snapshot.toJSON()).toMatchSnapshot()
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
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )
        fireEvent.press(getByText('allow requests'))
        await waitFor(() => queryByText('prevent requests'))
        expect(spy).toHaveBeenCalledWith(true)
    })

    it('should handle navigate to request team page', async () => {
        const { getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )
        await waitUntilRefreshComplete(getByTestId('mt-scroll-view'))

        fireEvent.press(getByTestId('create-button'))
        expect(navigate).toHaveBeenCalledWith('RequestTeam')
    })

    it('should handle fetch requests error', async () => {
        const spy = jest
            .spyOn(RequestData, 'getRequestsByUser')
            .mockReturnValueOnce(
                Promise.reject({ message: Constants.GET_REQUEST_ERROR }),
            )

        const { queryByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mt-scroll-view'))

        expect(queryByText(Constants.GET_REQUEST_ERROR)).not.toBeNull()
        expect(spy).toHaveBeenCalled()
    })

    it('should handle fetch after error', async () => {
        const spy = jest
            .spyOn(RequestData, 'getRequestsByUser')
            .mockReturnValueOnce(
                Promise.reject({ message: Constants.GET_REQUEST_ERROR }),
            )

        const { queryByText, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mt-scroll-view'))

        expect(queryByText(Constants.GET_REQUEST_ERROR)).not.toBeNull()
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
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mt-scroll-view'))

        jest.spyOn(RequestData, 'getRequestsByUser').mockReturnValueOnce(
            Promise.resolve([
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
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mt-scroll-view'))

        jest.spyOn(RequestData, 'getRequestsByUser').mockReturnValueOnce(
            Promise.resolve([
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
            .mockRejectedValueOnce({ message: 'test error message' })

        const { queryByText, getAllByTestId, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
                ,
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mt-scroll-view'))

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
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mt-scroll-view'))

        jest.spyOn(RequestData, 'getRequestsByUser').mockReturnValueOnce(
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
            ]),
        )

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
            .mockRejectedValue({ message: Constants.REQUEST_RESPONSE_ERROR })

        const { queryByText, getAllByTestId, getByTestId } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <UserRequestsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        await waitUntilRefreshComplete(getByTestId('mt-scroll-view'))

        expect(queryByText('@place6name6')).not.toBeNull()
        const deleteButtons = getAllByTestId('delete-button')
        fireEvent.press(deleteButtons[1])
        // Not optimal solution, see
        // ManageTeamDetailsScreen-test.tsx for further details
        await act(async () => {})

        expect(queryByText('@place6name6')).not.toBeNull()
        expect(queryByText(Constants.REQUEST_RESPONSE_ERROR)).not.toBeNull()
        expect(requestSpy).toHaveBeenCalled()
    })
})
