import * as AuthServices from '../../../src/services/network/auth'
import * as Constants from '../../../src/utils/constants'
import * as TeamServices from '../../../src/services/network/team'
import { AxiosResponse } from 'axios'
import GuestPlayerModal from '../../../src/components/molecules/GuestPlayerModal'
import LiveGameProvider from '../../../src/context/live-game-context'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import React from 'react'
import { game } from '../../../fixtures/data'
import { withRealm } from '../../utils/renderers'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

import { NavigationContainer } from '@react-navigation/native'
import { TeamFactory } from '../../test-data/team'


const client = new QueryClient()

describe('GuestPlayerModal', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    afterEach(() => {
        RNEncryptedStorage.getItem.mockReset()
        RNEncryptedStorage.setItem.mockReset()
    })

    it('should match snapshot', () => {
        const snapshot = render(
            withRealm(
                <QueryClientProvider client={client}>
                    <GuestPlayerModal
                        visible={true}
                        onClose={jest.fn()}
                        teamId=""
                    />
                </QueryClientProvider>,
            ),
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should call add player correctly', async () => {
        const team = TeamFactory.build()
        const spy = jest.spyOn(TeamServices, 'createGuest').mockReturnValue(
            Promise.resolve({
                data: {
                    team: {
                        ...team,
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
        let visible = true

        render(
            withRealm(
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <LiveGameProvider gameId={game._id}>
                            <GuestPlayerModal
                                visible={true}
                                onClose={() => {
                                    visible = false
                                }}
                                teamId=""
                            />
                        </LiveGameProvider>
                    </NavigationContainer>
                </QueryClientProvider>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Game', {
                            ...game,
                            startTime: '2022' as unknown as Date,
                            tournament: undefined,
                            offline: false,
                            statsPoints: [],
                        })
                    })
                },
            ),
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
        const team = TeamFactory.build()
        const spy = jest.spyOn(TeamServices, 'createGuest').mockReturnValue(
            Promise.resolve({
                data: {
                    team: {
                        ...team,
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
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <GuestPlayerModal
                            visible={true}
                            onClose={() => {
                                visible = false
                            }}
                            teamId=""
                        />
                    </QueryClientProvider>
                </NavigationContainer>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Game', {
                            ...game,
                            startTime: '2022' as unknown as Date,
                            tournament: undefined,
                            offline: false,
                            statsPoints: [],
                        })
                    })
                },
            ),
        )

        const button = getByText('add')
        fireEvent.press(button)

        await findByText('First name is required.')
        expect(spy).not.toHaveBeenCalled()
        expect(visible).toBe(true)
    })

    it('with network error', async () => {
        RNEncryptedStorage.getItem.mockReturnValue(Promise.resolve('token'))
        jest.spyOn(AuthServices, 'refreshToken').mockReturnValue(
            Promise.resolve({
                data: { tokens: { access: 'access', refresh: 'refresh' } },
                status: 200,
            } as AxiosResponse),
        )
        const spy = jest.spyOn(TeamServices, 'createGuest').mockReturnValue(
            Promise.resolve({
                data: { message: Constants.ADD_GUEST_ERROR },
                status: 400,
                statusText: 'Bad',
                config: {},
                headers: {},
            } as AxiosResponse),
        )

        spy.mockClear()
        let visible = true

        const { getByPlaceholderText, getByText } = render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <LiveGameProvider gameId={game._id}>
                            <GuestPlayerModal
                                visible={true}
                                onClose={() => {
                                    visible = false
                                }}
                                teamId=""
                            />
                        </LiveGameProvider>
                    </QueryClientProvider>
                </NavigationContainer>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Game', {
                            ...game,
                            startTime: '2022' as unknown as Date,
                            tournament: undefined,
                            offline: false,
                            statsPoints: [],
                        })
                    })
                },
            ),
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
        expect(getByText(Constants.ADD_GUEST_ERROR)).toBeTruthy()
        expect(visible).toBe(true)
    })
})
