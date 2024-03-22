import * as Constants from '../../../src/utils/constants'
import * as LocalGameServices from '../../../src/services/local/game'
import * as TeamServices from '../../../src/services/network/team'
import { AxiosResponse } from 'axios'
import GuestPlayerModal from '../../../src/components/molecules/GuestPlayerModal'
import { Provider } from 'react-redux'
import React from 'react'
import { game } from '../../../fixtures/data'
import store from '../../../src/store/store'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const client = new QueryClient()

describe('GuestPlayerModal', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValue(
            Promise.resolve(undefined),
        )
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should match snapshot', () => {
        const snapshot = render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <GuestPlayerModal visible={true} onClose={jest.fn()} />
                </QueryClientProvider>
            </Provider>,
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should call add player correctly', async () => {
        const spy = jest.spyOn(TeamServices, 'createGuest').mockReturnValue(
            Promise.resolve({
                data: {
                    team: {
                        players: [
                            ...game.teamOnePlayers,
                            {
                                _id: 'id',
                                firstName: 'First',
                                lastName: 'Last',
                                username: 'guest1234',
                            },
                        ],
                    },
                },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({
                ...game,
                startTime: '2022' as unknown as Date,
                tournament: undefined,
                offline: false,
            }),
        )
        let visible = true

        render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <GuestPlayerModal
                        visible={true}
                        onClose={() => {
                            visible = false
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        const firstInput = screen.getByPlaceholderText('First Name')
        const lastInput = screen.getByPlaceholderText('Last Name')

        fireEvent.changeText(firstInput, 'First')
        fireEvent.changeText(lastInput, 'Last')

        const button = screen.getByText('add')
        fireEvent.press(button)

        await waitFor(() => {
            expect(spy).toHaveBeenCalled()
        })
        expect(screen.queryByText('First')).toBeNull()
        expect(screen.queryByText('Last')).toBeNull()
        expect(visible).toBe(true)
    })

    it('with form errors', async () => {
        const spy = jest.spyOn(TeamServices, 'createGuest').mockReturnValue(
            Promise.resolve({
                data: {
                    team: {
                        players: [
                            ...game.teamOnePlayers,
                            {
                                _id: 'id',
                                firstName: 'First',
                                lastName: 'Last',
                                username: 'guest1234',
                            },
                        ],
                    },
                },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        spy.mockClear()
        let visible = true

        const { getByText, findByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <GuestPlayerModal
                        visible={true}
                        onClose={() => {
                            visible = false
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        const button = getByText('add')
        fireEvent.press(button)

        await findByText('First name is required.')
        expect(spy).not.toHaveBeenCalled()
        expect(visible).toBe(true)
    })

    it('with network error', async () => {
        const spy = jest.spyOn(TeamServices, 'createGuest').mockReturnValue(
            Promise.reject({
                data: { message: 'Bad guest' },
                status: 400,
                statusText: 'Bad',
                config: {},
                headers: {},
            }),
        )
        spy.mockClear()
        let visible = true

        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <GuestPlayerModal
                        visible={true}
                        onClose={() => {
                            visible = false
                        }}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        const firstInput = getByPlaceholderText('First Name')
        const lastInput = getByPlaceholderText('Last Name')

        fireEvent.changeText(firstInput, 'First')
        fireEvent.changeText(lastInput, 'Last')

        const button = getByText('add')
        fireEvent.press(button)

        await waitFor(() => {
            expect(spy).toHaveBeenCalled()
        })
        expect(getByText(Constants.ADD_GUEST_ERROR)).not.toBeNull()
        expect(visible).toBe(true)
    })
})
