import * as AccountReducer from '../../src/store/reducers/features/account/accountReducer'
import * as React from 'react'
import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import ResetPasswordScreen from '../../src/screens/ResetPasswordScreen'
import { fetchProfileData } from '../../fixtures/data'
import store from '../../src/store/store'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()

const token = '1234.asdf.6543'
const props: Props = {
    navigation: {
        navigate,
    } as any,
    route: { params: { hasPendingRequests: false } } as any,
}

afterEach(() => {
    navigate.mockReset()
    store.dispatch(AccountReducer.resetState())
})

describe('test reset password screen', () => {
    it('should match snapshot', async () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ResetPasswordScreen {...props} />
                </NavigationContainer>
            </Provider>,
        ).toJSON()

        expect(snapshot).toMatchSnapshot()
    })

    it('should handle successful submit', async () => {
        jest.spyOn(UserData, 'resetPassword').mockReturnValueOnce(
            Promise.resolve({
                token,
                user: fetchProfileData,
            }),
        )

        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ResetPasswordScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        fireEvent.changeText(getByPlaceholderText('Recovery Code'), '123456')
        fireEvent.changeText(getByPlaceholderText('New Password'), 'Pass1234!')
        fireEvent.press(getByText('Submit'))
        await act(async () => {})

        expect(store.getState().account.token).toBe(token)
        expect(store.getState().account.username).toBe(
            fetchProfileData.username,
        )
        expect(store.getState().account.playerTeams).toBe(
            fetchProfileData.playerTeams,
        )

        expect(navigate).toHaveBeenCalledWith('Profile')
    })

    it('should handle form errors', async () => {
        const { getByText, queryByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ResetPasswordScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        fireEvent.press(getByText('Submit'))
        await waitFor(() => queryByText('Recovery code is required.'))
        expect(queryByText('Password is required.')).toBeTruthy()
        expect(navigate).not.toHaveBeenCalled()
    })

    it('should handle network error', async () => {
        jest.spyOn(UserData, 'resetPassword').mockReturnValueOnce(
            Promise.reject({
                message: 'Error',
            }),
        )

        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ResetPasswordScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        fireEvent.changeText(getByPlaceholderText('Recovery Code'), '123456')
        fireEvent.changeText(getByPlaceholderText('New Password'), 'Pass1234!')
        fireEvent.press(getByText('Submit'))
        await act(async () => {})

        expect(store.getState().account.username).toBe('')
        expect(navigate).not.toHaveBeenCalled()
    })
})
