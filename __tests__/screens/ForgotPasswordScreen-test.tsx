import * as UserData from '../../src/services/data/user'
import { ForgotPasswordProps } from '../../src/types/navigation'
import ForgotPasswordScreen from '../../src/screens/ForgotPasswordScreen'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import renderer from 'react-test-renderer'
import { QueryClient, QueryClientProvider } from 'react-query'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const reset = jest.fn()
const navigate = jest.fn()

const props: ForgotPasswordProps = {
    navigation: {
        navigate,
        reset,
    } as any,
    route: {} as any,
}

const client = new QueryClient()

beforeEach(() => {
    reset.mockReset()
    navigate.mockReset()
})

describe('test forgot password screen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('should match snapshot', () => {
        const snapshot = renderer.create(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <ForgotPasswordScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>,
        )

        expect(snapshot).toMatchSnapshot()
    })

    it('test network error', async () => {
        const spy = jest
            .spyOn(UserData, 'requestPasswordRecovery')
            .mockClear()
            .mockReturnValueOnce(
                Promise.reject({
                    message: 'Unable to send email',
                }),
            )

        const { getByPlaceholderText, getByText, queryByText } = render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <ForgotPasswordScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>,
        )

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@email.com')
        fireEvent.press(getByText('Submit'))
        await act(async () => {})

        expect(queryByText('Unable to send email')).not.toBeNull()
        expect(spy).toHaveBeenCalled()
    })

    it('should call request password recovery with valid data', async () => {
        const spy = jest
            .spyOn(UserData, 'requestPasswordRecovery')
            .mockClear()
            .mockReturnValueOnce(Promise.resolve())

        const { getByPlaceholderText, getByText, queryByText } = render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <ForgotPasswordScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>,
        )

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@email.com')
        fireEvent.press(getByText('Submit'))
        await act(async () => {})

        expect(
            queryByText('Check your inbox for a recovery code!'),
        ).not.toBeNull()
        expect(spy).toHaveBeenCalledWith('test@email.com')
    })

    it('test form error', async () => {
        const spy = jest
            .spyOn(UserData, 'requestPasswordRecovery')
            .mockClear()
            .mockReturnValueOnce(Promise.resolve())

        const { getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <ForgotPasswordScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>,
        )

        fireEvent.changeText(getByPlaceholderText('Email'), 'testemailcom')
        fireEvent.press(getByText('Submit'))
        await act(async () => {})

        expect(spy).not.toHaveBeenCalled()
    })

    it('should navigate to reset password screen', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <ForgotPasswordScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>,
        )

        fireEvent.press(getByText('I Have A Code'))
        expect(navigate).toHaveBeenLastCalledWith('ResetPassword')
    })
})
