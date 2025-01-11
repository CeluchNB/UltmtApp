import * as RequestData from '../../src/services/data/request'
import * as TeamData from '../../src/services/data/team'
import { DetailedRequest } from '../../src/types/request'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { RequestTeamProps } from '../../src/types/navigation'
import RequestTeamScreen from '../../src/screens/RequestTeamScreen'
import store from '../../src/store/store'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

const goBack = jest.fn()
const setOptions = jest.fn()
const props: RequestTeamProps = {
    navigation: {
        goBack,
        setOptions,
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
                rosterOpen: false,
                requests: [],
                games: [],
            },
        ]),
    )
})

beforeEach(() => {
    jest.clearAllMocks()
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
    jest.spyOn(TeamData, 'searchTeam').mockRejectedValueOnce({
        message: 'search error',
    })

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
    jest.spyOn(TeamData, 'searchTeam').mockRejectedValueOnce({})

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

it('should display modal on closed team', async () => {
    const spy = jest.spyOn(RequestData, 'requestTeam')

    render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = screen.getByPlaceholderText('Search teams...')
    fireEvent.changeText(searchInput, 'place')

    const team2 = await screen.findByText('@place2name2')
    fireEvent.press(team2)

    expect(spy).not.toHaveBeenCalled()
    expect(goBack).not.toHaveBeenCalled()

    const warning = screen.getByText(
        "You cannot request to join this team. A team's manager can permit requests from the team's page.",
    )
    expect(warning).toBeTruthy()

    const doneBtn = screen.getByText('done')
    fireEvent.press(doneBtn)
    const warning2 = screen.queryByText(
        "You cannot request to join this team. A team's manager can permit requests from the team's page.",
    )
    expect(warning2).toBeFalsy()
})

it('should display error when request is unsuccessful', async () => {
    const spy = jest
        .spyOn(RequestData, 'requestTeam')
        .mockRejectedValueOnce({ message: 'request error' })
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
