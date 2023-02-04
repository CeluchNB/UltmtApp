import * as AuthData from '../../src/services/data/auth'
import * as Preferences from '../../src/services/data/preferences'
import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import SettingsScreen from '../../src/screens/SettingsScreen'
import { fetchProfileData } from '../../fixtures/data'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import {
    SecureEditField,
    SettingsScreenProps,
} from '../../src/types/navigation'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const props: SettingsScreenProps = {
    navigation: { navigate } as any,
    route: { params: {} } as any,
}

beforeEach(() => {
    store.dispatch(setProfile(fetchProfileData))
    jest.resetAllMocks()
})

it('should match snapshot', () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should handle logout press', async () => {
    const spy = jest
        .spyOn(AuthData, 'logout')
        .mockReturnValue(Promise.resolve())

    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Sign Out')

    fireEvent.press(button)
    expect(spy).toHaveBeenCalled()
    // should not need this
    await act(async () => {})
    expect(navigate).toHaveBeenCalledWith('Tabs', {
        params: { screen: 'Login' },
        screen: 'Account',
    })
})

it('should handle private account switch press', async () => {
    const spy = jest.spyOn(UserData, 'setPrivate')

    const { getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const switchEl = getByTestId('private-switch')

    await act(async () => {
        fireEvent(switchEl, 'valueChange')
    })

    expect(spy).toHaveBeenCalledWith(true)
})

it('should handle first name edit', async () => {
    const spy = jest
        .spyOn(UserData, 'changeName')
        .mockReturnValueOnce(
            Promise.resolve({ ...fetchProfileData, firstName: 'newfirst' }),
        )

    const { getAllByTestId, getByPlaceholderText, getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const editButton = getAllByTestId('ef-edit-button')[0]
    fireEvent.press(editButton)
    await act(async () => {})

    const editField = getByPlaceholderText('first')
    fireEvent.changeText(editField, 'newfirst')
    await act(async () => {})

    const submitButton = getAllByTestId('ef-submit-button')[0]
    fireEvent.press(submitButton)
    await act(async () => {})

    expect(spy).toHaveBeenCalledWith('newfirst', 'last')
    const newFirstText = getByText('newfirst')
    expect(newFirstText).toBeTruthy()
})

it('should handle first name edit error', async () => {
    const spy = jest
        .spyOn(UserData, 'changeName')
        .mockReturnValueOnce(Promise.reject({ message: 'Error message' }))

    const { getAllByTestId, getByPlaceholderText, getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const editButton = getAllByTestId('ef-edit-button')[0]
    fireEvent.press(editButton)
    await act(async () => {})

    const editField = getByPlaceholderText('first')
    fireEvent.changeText(editField, 'newfirst')
    await act(async () => {})

    const submitButton = getAllByTestId('ef-submit-button')[0]
    fireEvent.press(submitButton)
    await act(async () => {})

    expect(spy).toHaveBeenCalledWith('newfirst', 'last')
    const errorMessage = getByText('Error message')
    expect(errorMessage).toBeTruthy()
})

it('should handle last name edit', async () => {
    const spy = jest
        .spyOn(UserData, 'changeName')
        .mockReturnValueOnce(
            Promise.resolve({ ...fetchProfileData, lastName: 'newlast' }),
        )

    const { getAllByTestId, getByPlaceholderText, getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const editButton = getAllByTestId('ef-edit-button')[1]
    fireEvent.press(editButton)
    await act(async () => {})

    const editField = getByPlaceholderText('last')
    fireEvent.changeText(editField, 'newlast')
    await act(async () => {})

    const submitButton = getAllByTestId('ef-submit-button')[0]
    fireEvent.press(submitButton)
    await act(async () => {})

    expect(spy).toHaveBeenCalledWith('first', 'newlast')
    const newLastText = getByText('newlast')
    expect(newLastText).toBeTruthy()
})

it('should handle last name edit error', async () => {
    const spy = jest
        .spyOn(UserData, 'changeName')
        .mockReturnValueOnce(Promise.reject({ message: 'Error message' }))

    const { getAllByTestId, getByPlaceholderText, getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const editButton = getAllByTestId('ef-edit-button')[1]
    fireEvent.press(editButton)
    await act(async () => {})

    const editField = getByPlaceholderText('last')
    fireEvent.changeText(editField, 'newlast')
    await act(async () => {})

    const submitButton = getAllByTestId('ef-submit-button')[0]
    fireEvent.press(submitButton)
    await act(async () => {})

    expect(spy).toHaveBeenCalledWith('first', 'newlast')
    const errorMessage = getByText('Error message')
    expect(errorMessage).toBeTruthy()
})

it('should navigate to edit email', async () => {
    const { getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const editButton = getAllByTestId('ef-edit-button')[2]
    fireEvent.press(editButton)
    await act(async () => {})

    expect(navigate).toHaveBeenCalledWith('SecureEdit', {
        title: 'email',
        value: fetchProfileData.email,
        field: SecureEditField.EMAIL,
    })
})

it('should navigate to edit password', async () => {
    const { getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const editButton = getAllByTestId('ef-edit-button')[3]
    fireEvent.press(editButton)
    await act(async () => {})

    expect(navigate).toHaveBeenCalledWith('SecureEdit', {
        title: 'password',
        value: 'New password',
        field: SecureEditField.PASSWORD,
    })
})

it('should delete account', async () => {
    const spy = jest
        .spyOn(UserData, 'deleteAccount')
        .mockReturnValueOnce(Promise.resolve())

    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Delete Account')
    fireEvent.press(button)
    await act(async () => {})

    const yesButton = getByText('Yes')
    fireEvent.press(yesButton)
    await act(async () => {})

    expect(spy).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith('Tabs', {
        params: { screen: 'Login' },
        screen: 'Account',
    })
})

it('should handle delete account error', async () => {
    const spy = jest
        .spyOn(UserData, 'deleteAccount')
        .mockReturnValueOnce(Promise.reject({ message: 'Error message' }))

    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Delete Account')
    fireEvent.press(button)
    await act(async () => {})

    const yesButton = getByText('Yes')
    fireEvent.press(yesButton)
    await act(async () => {})

    expect(spy).toHaveBeenCalled()
    const errorMessage = getByText('Error message')
    expect(errorMessage).toBeTruthy()
    expect(navigate).not.toHaveBeenCalled()
})

it('should close delete account modal', async () => {
    const spy = jest
        .spyOn(UserData, 'deleteAccount')
        .mockReturnValueOnce(Promise.resolve())

    const { getByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Delete Account')
    fireEvent.press(button)
    await act(async () => {})

    const noButton = getByText('No')
    fireEvent.press(noButton)
    await act(async () => {})

    const yesButton = await queryByText('Yes')
    expect(yesButton).toBe(null)

    expect(spy).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalledWith('Login')
})

// Not 100% sure why, but this test needs to be at the end for the
// suite to function properly, should consider investigating this
// in the future.
it('should handle dark mode switch press', async () => {
    const spy = jest.spyOn(Preferences, 'setDarkMode')
    jest.spyOn(Preferences, 'isDarkMode').mockReturnValue(
        Promise.resolve(false),
    )

    const { getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SettingsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const switchEl = getByTestId('dark-mode-switch')

    await act(async () => {
        fireEvent(switchEl, 'valueChange')
    })

    expect(spy).toHaveBeenCalledWith(false)

    const screen = getByTestId('screen')
    expect(screen.props.style.backgroundColor).toBe('#ffffff')
})
