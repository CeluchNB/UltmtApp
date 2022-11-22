import * as ManagedTeamReducer from '../../src/store/reducers/features/team/managedTeamReducer'
import * as RequestData from '../../src/services/data/request'
import * as TeamData from '../../src/services/data/team'
import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { RequestUserProps } from '../../src/types/navigation'
import RequestUserScreen from '../../src/screens/RequestUserScreen'
import { Team } from '../../src/types/team'
import store from '../../src/store/store'
import { DetailedRequest, RequestType } from '../../src/types/request'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

const goBack = jest.fn()
const props: RequestUserProps = {
    navigation: {
        goBack,
    } as any,
    route: {
        params: { type: RequestType.PLAYER },
    } as any,
}

beforeAll(() => {
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
    expect(spy).toHaveBeenCalledWith('user1', 'team1')
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

    expect(spy).toHaveBeenCalledWith('user1', 'team1')
    expect(queryByText('request error')).not.toBeNull()
})

it('should correctly add manager', async () => {
    const spy = jest.spyOn(TeamData, 'addManager').mockReturnValueOnce(
        Promise.resolve({
            _id: 'team1',
        } as Team),
    )

    const managerProps: RequestUserProps = {
        navigation: {
            goBack,
        } as any,
        route: {
            params: { type: RequestType.MANAGER },
        } as any,
    }

    const { getByPlaceholderText, findByText, getAllByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...managerProps} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search managers...')
    fireEvent.changeText(searchInput, 'first')

    const user1 = await findByText('@first1last1')
    fireEvent.press(user1)
    await act(async () => {})

    const users = getAllByText('first1 last1')
    expect(users).toHaveLength(2)
    expect(spy).toHaveBeenCalledWith('team1', 'user1')
})

it('should handle add manager failure', async () => {
    const spy = jest.spyOn(TeamData, 'addManager').mockReturnValueOnce(
        Promise.reject({
            message: 'add manager error',
        }),
    )

    const managerProps: RequestUserProps = {
        navigation: {
            goBack,
        } as any,
        route: {
            params: { type: RequestType.MANAGER },
        } as any,
    }

    const { getByPlaceholderText, findByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...managerProps} />
            </NavigationContainer>
        </Provider>,
    )

    const searchInput = getByPlaceholderText('Search managers...')
    fireEvent.changeText(searchInput, 'first')

    const user1 = await findByText('@first1last1')
    fireEvent.press(user1)
    await act(async () => {})

    expect(spy).toHaveBeenCalledWith('team1', 'user1')
    expect(queryByText('add manager error')).not.toBeNull()
})

it('should get bulk code', async () => {
    const spy = jest
        .spyOn(TeamData, 'createBulkJoinCode')
        .mockReturnValueOnce(Promise.resolve('123456'))

    const { getByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('create bulk join code')
    fireEvent.press(button)

    expect(spy).toHaveBeenCalled()

    const modal = getByTestId('base-modal')
    await act(async () => {})
    expect(modal.props.visible).toBe(true)
})

it('should handle get bulk code error', async () => {
    const spy = jest
        .spyOn(TeamData, 'createBulkJoinCode')
        .mockReturnValueOnce(Promise.reject({ message: 'bulk code error' }))

    const { getByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('create bulk join code')
    fireEvent.press(button)

    expect(spy).toHaveBeenCalled()

    const modal = getByTestId('base-modal')
    await act(async () => {})
    expect(modal.props.visible).toBe(true)

    const error = getByText('bulk code error')
    expect(error).toBeTruthy()
})

it('should close bulk code modal', async () => {
    const spy = jest
        .spyOn(TeamData, 'createBulkJoinCode')
        .mockReturnValueOnce(Promise.resolve('123456'))

    const { getByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RequestUserScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('create bulk join code')
    fireEvent.press(button)

    expect(spy).toHaveBeenCalled()

    const modal = getByTestId('base-modal')
    await act(async () => {})
    expect(modal.props.visible).toBe(true)

    const doneButton = getByText('done')
    fireEvent.press(doneButton)

    const closedModal = getByTestId('base-modal')
    await act(async () => {})
    expect(closedModal.props.visible).toBe(false)
})
