import * as TeamServices from '../../../src/services/data/team'
import AddGuestScreen from '../../../src/screens/teams/AddGuestScreen'
import { ApiError } from '../../../src/types/services'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../../src/store/store'
import { teamOne } from '../../../fixtures/data'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

const props = {
    navigation: {},
    route: { params: { teamId: '' } },
} as any

const client = new QueryClient()

describe('AddGuestScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('successfully adds a guest', async () => {
        jest.spyOn(TeamServices, 'createGuest').mockReturnValueOnce(
            Promise.resolve({
                ...teamOne,
                managers: [],
                players: [],
                seasonNumber: 1,
                continuationId: '',
                rosterOpen: true,
                requests: [],
            }),
        )
        render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <AddGuestScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        const firstNameInput = screen.getByPlaceholderText('First Name')
        fireEvent.changeText(firstNameInput, 'Noah')
        const lastNameInput = screen.getByPlaceholderText('Last Name')
        fireEvent.changeText(lastNameInput, 'Celuch')

        const submitBtn = screen.getByText('submit')
        fireEvent.press(submitBtn)

        await waitFor(() => {
            expect(screen.getByText('Noah Celuch')).toBeTruthy()
        })
    })

    it('displays error', async () => {
        jest.spyOn(TeamServices, 'createGuest').mockImplementationOnce(() => {
            throw new ApiError('test error')
        })
        render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <AddGuestScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        const firstNameInput = screen.getByPlaceholderText('First Name')
        fireEvent.changeText(firstNameInput, 'Noah')
        const lastNameInput = screen.getByPlaceholderText('Last Name')
        fireEvent.changeText(lastNameInput, 'Celuch')

        const submitBtn = screen.getByText('submit')
        fireEvent.press(submitBtn)

        await waitFor(() => {
            expect(screen.getByText('test error')).toBeTruthy()
        })
    })
})
