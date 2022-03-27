import * as AccountReducer from '../../src/store/reducers/features/account/accountReducer'
import * as ManagedTeamReducer from '../../src/store/reducers/features/team/managedTeamReducer'
import * as RequestData from '../../src/services/data/request'
import * as UserData from '../../src/services/data/user'
import { DetailedRequest } from '../../src/types/request'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import RequestUserScreen from '../../src/screens/RequestUserScreen'
import { Team } from '../../src/types/team'
import store from '../../src/store/store'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const token = '1234.asdf.1234'
const goBack = jest.fn()
const props: Props = {
    navigation: {
        goBack,
    } as any,
    route: {} as any,
}

beforeAll(() => {
    store.dispatch(AccountReducer.setToken(token))
    store.dispatch(
        ManagedTeamReducer.setTeam({
            _id: 'team1',
        } as Team),
    )

    jest.spyOn(UserData, 'searchUsers').mockReturnValue(
        Promise.resolve([
            {
                _id: 'user1',
                firstName: 'first1',
                lastName: 'last1',
                username: 'first1last1',
            },
            {
                _id: 'user2',
                firstName: 'first2',
                lastName: 'last2',
                username: 'first2last2',
            },
        ]),
    )
})

it('should match snapshot', async () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should display search results', async () => {
    const { getByPlaceholderText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search players...')
    fireEvent.changeText(searchInput, 'first')

    await waitFor(() => queryByText('@first1last1'))
    expect(queryByText('@first2last2')).not.toBeNull()
})

it('should not search with less than 3 characters', async () => {
    const { getByPlaceholderText, findByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search players...')
    fireEvent.changeText(searchInput, 'fi')

    await expect(findByText('@first1last1')).rejects.toThrow()
})

it('should display search error', async () => {
    jest.spyOn(UserData, 'searchUsers').mockReturnValueOnce(
        Promise.reject({ message: 'search error' }),
    )

    const { getByPlaceholderText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search players...')
    fireEvent.changeText(searchInput, 'first')

    await waitFor(() =>
        queryByText('No results from this search, please try again'),
    )
})

it('should display error with no search results', async () => {
    jest.spyOn(UserData, 'searchUsers').mockReturnValueOnce(Promise.resolve([]))

    const { getByPlaceholderText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search players...')
    fireEvent.changeText(searchInput, 'first')

    await waitFor(() =>
        queryByText('No results from this search, please try again'),
    )
})

it('should correctly request user join', async () => {
    const spy = jest.spyOn(RequestData, 'requestUser').mockReturnValueOnce(
        Promise.resolve({
            _id: 'request1',
        } as DetailedRequest),
    )
    const { getByPlaceholderText, findByText, getAllByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search players...')
    fireEvent.changeText(searchInput, 'first')

    const user1 = await findByText('@first1last1')
    fireEvent.press(user1)
    await act(async () => {})

    const users = getAllByText('first1 last1')
    expect(users).toHaveLength(2)
    expect(spy).toHaveBeenCalledWith(token, 'user1', 'team1')
})

it('should handle request error', async () => {
    const spy = jest.spyOn(RequestData, 'requestUser').mockReturnValueOnce(
        Promise.reject({
            message: 'request error',
        }),
    )
    const { getByPlaceholderText, findByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search players...')
    fireEvent.changeText(searchInput, 'first')

    const user1 = await findByText('@first1last1')
    fireEvent.press(user1)
    await act(async () => {})

    expect(spy).toHaveBeenCalledWith(token, 'user1', 'team1')
    expect(queryByText('request error')).not.toBeNull()
})
