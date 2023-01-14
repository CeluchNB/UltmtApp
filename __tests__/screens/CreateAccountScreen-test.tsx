import * as UserData from '../../src/services/data/user'
import { CreateAccountProps } from '../../src/types/navigation'
import CreateAccountScreen from '../../src/screens/CreateAccountScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { User } from '../../src/types/user'
import renderer from 'react-test-renderer'
import store from '../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const reset = jest.fn()
const navigate = jest.fn()
const goBack = jest.fn()

const props: CreateAccountProps = {
    navigation: {
        navigate,
        reset,
        goBack,
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
    stats: [],
    openToRequests: true,
    private: false,
}

beforeEach(() => {
    navigate.mockReset()
    reset.mockReset()
    goBack.mockReset()
})

it('should match snapshot', () => {
    const snapshot = renderer.create(
        <Provider store={store}>
            <CreateAccountScreen {...props} />
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
    const { getByPlaceholderText, getAllByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateAccountScreen {...props} />
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
    const { getByPlaceholderText, getAllByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateAccountScreen {...props} />
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
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateAccountScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    fireEvent.press(getByText('Back'))

    expect(goBack).toHaveBeenCalled()
})
