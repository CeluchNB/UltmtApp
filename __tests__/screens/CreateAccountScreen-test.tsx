import * as UserData from '../../src/services/data/user'
import { CreateAccountProps } from '../../src/types/navigation'
import CreateAccountScreen from '../../src/screens/CreateAccountScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { User } from '../../src/types/user'
import renderer from 'react-test-renderer'
import store from '../../src/store/store'
import { QueryClient, QueryClientProvider } from 'react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const reset = jest.fn()
const navigate = jest.fn()
const goBack = jest.fn()
const setOptions = jest.fn()

const props: CreateAccountProps = {
    navigation: {
        navigate,
        reset,
        goBack,
        setOptions,
    } as any,
    route: {} as any,
}

const user: User = {
    _id: 'id1',
    firstName: 'first',
    lastName: 'last',
    username: 'firstlast',
    email: 'email@email.com',
    requests: [],
    managerTeams: [],
    playerTeams: [],
    archiveTeams: [],
    openToRequests: true,
    private: false,
}

const client = new QueryClient()

beforeEach(() => {
    navigate.mockReset()
    reset.mockReset()
    goBack.mockReset()
})

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})
afterAll(() => {
    jest.useRealTimers()
})

it('should match snapshot', () => {
    jest.spyOn(UserData, 'usernameIsTaken').mockReturnValue(
        Promise.resolve(true),
    )
    const snapshot = renderer.create(
        <Provider store={store}>
            <QueryClientProvider client={client}>
                <CreateAccountScreen {...props} />
            </QueryClientProvider>
        </Provider>,
    )

    expect(snapshot).toMatchSnapshot()
})

it('should handle successful create account', async () => {
    const spy = jest
        .spyOn(UserData, 'createAccount')
        .mockReturnValueOnce(
            Promise.resolve({ user, token: '1234.234.fsg234' }),
        )

    jest.spyOn(UserData, 'usernameIsTaken').mockReturnValue(
        Promise.resolve(false),
    )

    const { getByPlaceholderText, getAllByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <CreateAccountScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>
        </Provider>,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'first')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'last')
    fireEvent.changeText(getByPlaceholderText('Username'), 'firstlast')
    fireEvent.changeText(getByPlaceholderText('Email'), 'email@email.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'Pass1234!')
    fireEvent.press(getAllByText('Create')[0])

    await waitFor(() => {
        expect(navigate).toHaveBeenCalledWith('Profile')
    })
    spy.mockRestore()
})

it('should handle unsuccessful create account', async () => {
    const spy = jest
        .spyOn(UserData, 'createAccount')
        .mockReturnValueOnce(Promise.reject({ message: 'there was an error' }))
    jest.spyOn(UserData, 'usernameIsTaken').mockReturnValue(
        Promise.resolve(false),
    )

    const { getByPlaceholderText, getAllByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <CreateAccountScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>
        </Provider>,
    )

    fireEvent.changeText(getByPlaceholderText('First Name'), 'first')
    fireEvent.changeText(getByPlaceholderText('Last Name'), 'last')
    fireEvent.changeText(getByPlaceholderText('Username'), 'firstlast')
    fireEvent.changeText(getByPlaceholderText('Email'), 'email@email.com')
    fireEvent.changeText(getByPlaceholderText('Password'), 'Pass1234!')
    fireEvent.press(getAllByText('Create')[0])

    await waitFor(() => queryByText('there was an error'))
    expect(navigate).not.toHaveBeenCalled()
    spy.mockRestore()
})

it('should handle back button', async () => {
    jest.spyOn(UserData, 'usernameIsTaken').mockReturnValue(
        Promise.resolve(false),
    )
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <CreateAccountScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>
        </Provider>,
    )

    fireEvent.press(getByText('Back'))

    expect(goBack).toHaveBeenCalled()
})
