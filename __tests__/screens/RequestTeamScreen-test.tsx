import * as RequestData from '../../src/services/data/request'
import * as TeamData from '../../src/services/data/team'
import { DetailedRequest } from '../../src/types/request'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import RequestTeamScreen from '../../src/screens/RequestTeamScreen'
import store from '../../src/store/store'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const goBack = jest.fn()
const props: Props = {
    navigation: {
        goBack,
    } as any,
    route: {} as any,
}

beforeAll(async () => {
    jest.spyOn(TeamData, 'searchTeam').mockResolvedValue(
        Promise.resolve([
            {
                _id: 'team1',
                place: 'place1',
                name: 'name1',
                teamname: 'place1name1',
                managers: [],
                players: [],
                seasonNumber: 1,
                seasonStart: '2022',
                seasonEnd: '2022',
                continuationId: '1',
                rosterOpen: true,
                requests: [],
                games: [],
            },
            {
                _id: 'team2',
                place: 'place2',
                name: 'name2',
                teamname: 'place2name2',
                managers: [],
                players: [],
                seasonNumber: 1,
                seasonStart: '2021',
                seasonEnd: '2021',
                continuationId: '2',
                rosterOpen: true,
                requests: [],
                games: [],
            },
        ]),
    )
})

beforeEach(() => {
    goBack.mockClear()
})

it('should match snapshot', async () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should display teams from search', async () => {
    const { queryByText, getByPlaceholderText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search teams...')
    fireEvent.changeText(searchInput, 'place')

    await waitFor(() => queryByText('@place1name1'))
    expect(queryByText('@place2name2')).not.toBeNull()
})

it('should not search with less than 3 characters', async () => {
    const { findByText, getByPlaceholderText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search teams...')
    fireEvent.changeText(searchInput, 'pl')

    await expect(findByText('@place1name1')).rejects.toThrow()
})

it('should display search error', async () => {
    jest.spyOn(TeamData, 'searchTeam').mockResolvedValueOnce(
        Promise.reject({ message: 'search error' }),
    )

    const { queryByText, getByPlaceholderText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search teams...')
    fireEvent.changeText(searchInput, 'place')

    await waitFor(() => queryByText('search error'))
})

it('should display search error with no message', async () => {
    jest.spyOn(TeamData, 'searchTeam').mockResolvedValueOnce(Promise.reject({}))

    const { queryByText, getByPlaceholderText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search teams...')
    fireEvent.changeText(searchInput, 'place')

    await waitFor(() => queryByText('No search results from this query.'))
})

it('should request team when pressed', async () => {
    const spy = jest
        .spyOn(RequestData, 'requestTeam')
        .mockReturnValueOnce(
            Promise.resolve({ _id: 'request1' } as DetailedRequest),
        )
    const { findByText, getByPlaceholderText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search teams...')
    fireEvent.changeText(searchInput, 'place')

    const team1 = await findByText('@place1name1')
    fireEvent.press(team1)
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(spy).toHaveBeenCalledWith('team1')
    const state = store.getState()
    expect(state.account.requests[0]).toBe('request1')
    expect(goBack).toHaveBeenCalled()
})

it('should display error when request is unsuccessful', async () => {
    const spy = jest
        .spyOn(RequestData, 'requestTeam')
        .mockReturnValueOnce(Promise.reject({ message: 'request error' }))
    const { findByText, getByPlaceholderText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search teams...')
    fireEvent.changeText(searchInput, 'place')

    const team1 = await findByText('@place1name1')
    fireEvent.press(team1)
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(spy).toHaveBeenCalled()
    expect(queryByText('request error')).not.toBeNull()
})
