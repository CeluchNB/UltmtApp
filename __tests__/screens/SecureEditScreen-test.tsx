import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import SecureEditScreen from '../../src/screens/SecureEditScreen'
import { fetchProfileData } from '../../fixtures/data'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { SecureEditField, SecureEditProps } from '../../src/types/navigation'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const goBack = jest.fn()
const setOptions = jest.fn()
let props: SecureEditProps

beforeEach(() => {
    store.dispatch(setProfile(fetchProfileData))
    props = {
        navigation: { goBack, setOptions } as any,
        route: {
            params: {
                title: 'Email',
                value: 'test@email.com',
                field: SecureEditField.EMAIL,
            },
        } as any,
    }
    goBack.mockReset()
})

it('should submit email successfully', async () => {
    const spy = jest
        .spyOn(UserData, 'changeEmail')
        .mockReset()
        .mockReturnValueOnce(Promise.resolve(fetchProfileData))

    const { getByText, getByPlaceholderText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SecureEditScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const valueField = getByPlaceholderText(props.route.params.value)
    fireEvent.changeText(valueField, 'newemail@email.com')

    const passwordField = getByPlaceholderText('Current Password')
    fireEvent.changeText(passwordField, 'Pass1234!')

    const submitButton = getByText('Change Email')
    fireEvent.press(submitButton)

    await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(
            props.route.params.value,
            'Pass1234!',
            'newemail@email.com',
        )
    })
    expect(goBack).toHaveBeenCalled()
})

it('should submit email and fail front end validation', async () => {
    const spy = jest
        .spyOn(UserData, 'changeEmail')
        .mockReset()
        .mockReturnValueOnce(Promise.resolve(fetchProfileData))

    const { getByText, getByPlaceholderText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SecureEditScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const valueField = getByPlaceholderText(props.route.params.value)
    fireEvent.changeText(valueField, 'bademail')

    const passwordField = getByPlaceholderText('Current Password')
    fireEvent.changeText(passwordField, '')

    const submitButton = getByText('Change Email')
    fireEvent.press(submitButton)

    await waitFor(() => {
        expect(getByText('Email must be in valid email format.')).toBeTruthy()
    })

    expect(spy).not.toHaveBeenCalled()
    expect(getByText('Current password is required.')).toBeTruthy()
    expect(goBack).not.toHaveBeenCalled()
})

it('should submit email and fail back end call', async () => {
    const spy = jest
        .spyOn(UserData, 'changeEmail')
        .mockReset()
        .mockRejectedValueOnce({ message: 'Network error.' })

    const { getByText, getByPlaceholderText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SecureEditScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const valueField = getByPlaceholderText(props.route.params.value)
    fireEvent.changeText(valueField, 'email@email.com')

    const passwordField = getByPlaceholderText('Current Password')
    fireEvent.changeText(passwordField, 'badpass')

    const submitButton = getByText('Change Email')
    fireEvent.press(submitButton)

    await waitFor(() => {
        expect(spy).toHaveBeenCalled()
    })

    expect(getByText('Network error.')).toBeTruthy()
    expect(goBack).not.toHaveBeenCalled()
})

it('should submit password successfully', async () => {
    props = {
        navigation: { goBack, setOptions } as any,
        route: {
            params: {
                title: 'Password',
                value: 'New Password',
                field: SecureEditField.PASSWORD,
            },
        } as any,
    }

    const spy = jest
        .spyOn(UserData, 'changePassword')
        .mockReset()
        .mockReturnValueOnce(Promise.resolve(fetchProfileData))

    const { getByText, getByPlaceholderText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SecureEditScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const valueField = getByPlaceholderText(props.route.params.value)
    fireEvent.changeText(valueField, 'Test987!')

    const passwordField = getByPlaceholderText('Current Password')
    fireEvent.changeText(passwordField, 'Pass1234!')

    const submitButton = getByText('Change Password')
    fireEvent.press(submitButton)

    await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(
            'test@email.com',
            'Pass1234!',
            'Test987!',
        )
    })
    expect(goBack).toHaveBeenCalled()
})
