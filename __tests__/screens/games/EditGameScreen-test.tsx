import * as GameNetwork from '../../../src/services/network/game'
import { AxiosResponse } from 'axios'
import { EditGameProps } from '../../../src/types/navigation'
import EditGameScreen from '../../../src/screens/games/EditGameScreen'
import { GameFactory } from '../../test-data/game'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { withRealm } from '../../utils/renderers'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const goBack = jest.fn()
const game = GameFactory.build()
const props: EditGameProps = {
    navigation: {
        goBack,
    } as any,
    route: { params: { gameId: game._id } } as any,
}

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})

afterAll(() => {
    jest.useRealTimers()
})

const client = new QueryClient()

describe('EditGameScreen', () => {
    it('matches snapshot', () => {
        render(
            withRealm(
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <EditGameScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Game', { ...game, offline: false })
                    })
                },
            ),
        )

        expect(screen.getByText('Game to')).toBeTruthy()
        expect(screen.getByText('Half at')).toBeTruthy()
        expect(screen.getByText('make updates')).toBeTruthy()
    })

    it('handles update press', async () => {
        jest.spyOn(GameNetwork, 'editGame').mockReturnValue(
            Promise.resolve({
                data: { game },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        render(
            withRealm(
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <EditGameScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Game', { ...game, offline: false })
                    })
                },
            ),
        )

        const updateBtn = screen.getByText('make updates')
        fireEvent.press(updateBtn)

        await waitFor(() => {
            expect(goBack).toHaveBeenCalled()
        })
    })
})
