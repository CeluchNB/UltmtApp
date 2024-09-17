import * as AuthData from '../../src/services/data/auth'
import { ApiError } from '../../src/types/services'
import { LoginProps } from '../../src/types/navigation'
import LoginScreen from '../../src/screens/LoginScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import renderer from 'react-test-renderer'
import store from '../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const reset = jest.fn()
const navigate = jest.fn()
const addListener = jest.fn().mockImplementation((event, callback) => {
    callback()
})

const props: LoginProps = {
    navigation: {
        navigate,
        reset,
        addListener,
    } as any,
    route: {} as any,
}

beforeEach(() => {
    reset.mockReset()
    navigate.mockReset()
})

describe('LoginScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('test matches snapshot', () => {
        const tree = renderer
            .create(
                <Provider store={store}>
                    <LoginScreen {...props} />
                </Provider>,
            )
            .toJSON()
        expect(tree).toMatchSnapshot()
    })

    it('test successful login', async () => {
        const spy = jest
            .spyOn(AuthData, 'login')
            .mockImplementationOnce(async () => {
                return
            })
        const { getByPlaceholderText, getAllByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <LoginScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        fireEvent.changeText(getByPlaceholderText('Username or Email'), 'user')
        fireEvent.changeText(getByPlaceholderText('Password'), 'pass')
        fireEvent.press(getAllByText('Login')[1])

        await waitFor(() => {
            expect(reset).toHaveBeenCalled()
        })

        spy.mockRestore()
    })

    it('should handle login error', async () => {
        const spy = jest
            .spyOn(AuthData, 'login')
            .mockImplementationOnce(async () => {
                throw new ApiError('error')
            })

        const { getAllByText, getByPlaceholderText, queryByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <LoginScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        fireEvent.changeText(getByPlaceholderText('Username or Email'), 'user')
        fireEvent.changeText(getByPlaceholderText('Password'), 'pass')
        fireEvent.press(getAllByText('Login')[1])

        await waitFor(() => queryByText('error'))
        expect(reset).not.toHaveBeenCalled()
        spy.mockRestore()
    })

    it('should handle get local token success', async () => {
        const spy = jest
            .spyOn(AuthData, 'isLoggedIn')
            .mockImplementationOnce(async () => {
                return true
            })

        render(
            <Provider store={store}>
                <NavigationContainer>
                    <LoginScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        await waitFor(() => expect(reset).toHaveBeenCalled())
        spy.mockRestore()
    })

    it('should handle create profile button press', async () => {
        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <LoginScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        fireEvent.press(getByText('Create Account'))

        expect(navigate).toHaveBeenCalled()
    })

    it('should handle forgot password button press', async () => {
        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <LoginScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        fireEvent.press(getByText('Forgot Password?'))

        expect(navigate).toHaveBeenCalledWith('ForgotPassword')
    })
})
