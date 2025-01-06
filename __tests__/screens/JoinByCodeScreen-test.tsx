import * as UserData from '../../src/services/data/user'
import { JoinByCodeProps } from '../../src/types/navigation'
import JoinByCodeScreen from '../../src/screens/JoinByCodeScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { fetchProfileData } from '../../fixtures/data'
import renderer from 'react-test-renderer'
import store from '../../src/store/store'
import { QueryClient, QueryClientProvider } from 'react-query'
import { act, fireEvent, render } from '@testing-library/react-native'

const navigate = jest.fn()

const props: JoinByCodeProps = {
    navigation: {
        navigate,
    } as any,
    route: {} as any,
}

const client = new QueryClient()

beforeEach(() => {
    navigate.mockReset()
})

describe('JoinByCodeScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should match snapshot', () => {
        const snapshot = renderer
            .create(
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <JoinByCodeScreen {...props} />
                    </QueryClientProvider>
                </Provider>,
            )
            .toJSON()

        expect(snapshot).toMatchSnapshot()
    })

    it('should handle failed code submission', async () => {
        const spy = jest
            .spyOn(UserData, 'joinTeamByCode')
            .mockReturnValueOnce(
                Promise.reject({ message: 'Cannot join team' }),
            )

        const { getByText, getByPlaceholderText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <JoinByCodeScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        const input = getByPlaceholderText('6 Digit Code')
        const button = getByText('join')

        fireEvent.changeText(input, '123456')
        fireEvent.press(button)
        await act(async () => {})

        expect(spy).toHaveBeenCalled()
        expect(getByText('Cannot join team')).toBeTruthy()
    })

    it('should handle successful code submission', async () => {
        const spy = jest
            .spyOn(UserData, 'joinTeamByCode')
            .mockReturnValueOnce(Promise.resolve(fetchProfileData))

        const { getByText, getByPlaceholderText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <JoinByCodeScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        const input = getByPlaceholderText('6 Digit Code')
        const button = getByText('join')

        fireEvent.changeText(input, '123456')
        fireEvent.press(button)
        await act(async () => {})

        expect(spy).toHaveBeenCalled()
        expect(getByText('Success!')).toBeTruthy()

        const doneButton = getByText('Done')
        fireEvent.press(doneButton)

        expect(navigate).toHaveBeenCalledWith('ManageTeams')
    })
})
