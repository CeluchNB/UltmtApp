import * as ManagedTeamReducer from '../../src/store/reducers/features/team/managedTeamReducer'
import * as RequestData from '../../src/services/data/request'
import * as TeamData from '../../src/services/data/team'
import { DetailedRequest } from '../../src/types/request'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { RequestType } from '../../src/types/request'
import { Team } from '../../src/types/team'
import { TeamRequestProps } from '../../src/types/navigation'
import TeamRequestsScreen from '../../src/screens/TeamRequestsScreen'
import store from '../../src/store/store'
import { waitUntilRefreshComplete } from '../../fixtures/utils'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})
const setOptions = jest.fn()

const props: TeamRequestProps = {
    navigation: {
        navigate,
        addListener,
        setOptions,
    } as any,
    route: {} as any,
}

let getManagedTeamResponse: Team
let requestObject: DetailedRequest

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
    jest.spyOn(RequestData, 'getRequestsByTeam').mockReturnValue(
        Promise.resolve([
            {
                ...requestObject,
                _id: 'request1',
                requestSource: 'team',
                userDetails: {
                    _id: 'playerid2',
                    firstName: 'first2',
                    lastName: 'last2',
                    username: 'first2last2',
                },
            },
            {
                ...requestObject,
                _id: 'request2',
                requestSource: 'player',
                userDetails: {
                    _id: 'playerid3',
                    firstName: 'first3',
                    lastName: 'last3',
                    username: 'first3last3',
                },
            },
        ]),
    )
    jest.spyOn(TeamData, 'getManagedTeam').mockReturnValue(
        Promise.resolve(getManagedTeamResponse),
    )
    store.dispatch(ManagedTeamReducer.setTeam(getManagedTeamResponse))
})

it('should match snapshot', async () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitUntilRefreshComplete(snapshot.getByTestId('mtd-flat-list'))

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should handle get request error', async () => {
    const spy = jest
        .spyOn(RequestData, 'getRequestsByTeam')
        .mockReturnValueOnce(Promise.reject({ message: 'test error' }))

    const { queryByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

    expect(spy).toHaveBeenCalled()
    expect(queryByText('test error')).not.toBeNull()
})

it('should toggle roster status', async () => {
    const dataFn = jest
        .fn()
        .mockImplementationOnce(async (_token, id, open) => {
            return { rosterOpen: open } as Team
        })
    const spy = jest.spyOn(ManagedTeamReducer, 'toggleRosterStatus')

    jest.spyOn(TeamData, 'toggleRosterStatus').mockImplementationOnce(dataFn)

    const { getByText, queryByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

    const button = getByText('Open Roster')
    fireEvent.press(button)

    waitFor(() => queryByText('Close Roster'))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(dataFn).toHaveBeenCalledTimes(1)
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
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

    jest.spyOn(RequestData, 'getRequestsByTeam').mockReturnValue(
        Promise.resolve([
            {
                ...requestObject,
                _id: 'request1',
                requestSource: 'team',
                userDetails: {
                    _id: 'playerid2',
                    firstName: 'first2',
                    lastName: 'last2',
                    username: 'first2last2',
                },
            },
        ]),
    )

    const acceptButtons = getAllByTestId('accept-button')
    expect(queryByText('@first3last3')).not.toBeNull()

    fireEvent.press(acceptButtons[0])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(queryByText('@first3last3')).toBeNull()
    expect(responseSpy).toHaveBeenCalledWith('request2', true)
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
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

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
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

    jest.spyOn(RequestData, 'getRequestsByTeam').mockReturnValue(
        Promise.resolve([
            {
                ...requestObject,
                _id: 'request1',
                requestSource: 'team',
                userDetails: {
                    _id: 'playerid2',
                    firstName: 'first2',
                    lastName: 'last2',
                    username: 'first2last2',
                },
            },
        ]),
    )

    const deleteButtons = getAllByTestId('delete-button')
    fireEvent.press(deleteButtons[0])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(queryByText('@first3last3')).toBeNull()

    expect(responseSpy).toHaveBeenCalledWith('request2', false)
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
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

    jest.spyOn(RequestData, 'getRequestsByTeam').mockReturnValue(
        Promise.resolve([
            {
                ...requestObject,
                _id: 'request2',
                requestSource: 'player',
                userDetails: {
                    _id: 'playerid3',
                    firstName: 'first3',
                    lastName: 'last3',
                    username: 'first3last3',
                },
            },
        ]),
    )

    const username = '@first2last2'
    expect(queryByText(username)).not.toBeNull()
    const deleteButtons = getAllByTestId('delete-button')
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    fireEvent.press(deleteButtons[1])
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
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

    const username = '@first2last2'
    expect(queryByText(username)).not.toBeNull()
    const deleteButtons = getAllByTestId('delete-button')
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    fireEvent.press(deleteButtons[1])
    await act(async () => {})

    expect(queryByText(username)).not.toBeNull()
    expect(queryByText('delete error message')).not.toBeNull()
})

it('should handle navigate to request player', async () => {
    const { getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitUntilRefreshComplete(getByTestId('mtd-flat-list'))

    const button = getByTestId('create-button')
    fireEvent.press(button)

    expect(navigate).toHaveBeenCalledWith('RequestUser', {
        type: RequestType.PLAYER,
    })
})
