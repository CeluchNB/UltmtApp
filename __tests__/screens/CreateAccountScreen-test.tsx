import * as UserData from '../../src/services/data/user'
import CreateAccountScreen from '../../src/screens/CreateAccountScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import { User } from '../../src/types/user'
import renderer from 'react-test-renderer'
import store from '../../src/store/store'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const reset = jest.fn()
const navigate = jest.fn()
const goBack = jest.fn()

const props: Props = {
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
    jest.spyOn(UserData, 'createAccount').mockReturnValueOnce(
        Promise.resolve({ user, token: '1234.234.fsg234' }),
    )
    const { getByPlaceholderText, getAllByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateAccountScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await act(async () => {
        await fireEvent.changeText(getByPlaceholderText('First Name'), 'first')
        await fireEvent.changeText(getByPlaceholderText('Last Name'), 'last')
        await fireEvent.changeText(
            getByPlaceholderText('Username'),
            'firstlast',
        )
        await fireEvent.changeText(
            getByPlaceholderText('Email'),
            'email@email.com',
        )
        await fireEvent.changeText(
            getByPlaceholderText('Password'),
            'Pass1234!',
        )
        await fireEvent.press(getAllByText('Create')[0])
    })

    expect(navigate).toHaveBeenCalledWith('Profile')
})

it('should handle unsuccessful create account', async () => {
    jest.spyOn(UserData, 'createAccount').mockReturnValueOnce(
        Promise.reject({ message: 'there was an error' }),
    )
    const { getByPlaceholderText, getAllByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateAccountScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await act(async () => {
        fireEvent.changeText(getByPlaceholderText('First Name'), 'first')
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'last')
        fireEvent.changeText(getByPlaceholderText('Username'), 'firstlast')
        fireEvent.changeText(getByPlaceholderText('Email'), 'email@email.com')
        fireEvent.changeText(getByPlaceholderText('Password'), 'Pass1234!')
        fireEvent.press(getAllByText('Create')[0])
    })

    expect(navigate).not.toHaveBeenCalled()
})

it('should handle back button', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateAccountScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await act(async () => {
        fireEvent.press(getByText('Back'))
    })

    expect(goBack).toHaveBeenCalled()
})
