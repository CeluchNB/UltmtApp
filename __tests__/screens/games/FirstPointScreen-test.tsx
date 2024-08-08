import * as PointNetwork from '../../../src/services/network/point'
import { AxiosResponse } from 'axios'
import { FirstPointProps } from '../../../src/types/navigation'
import FirstPointScreen from '../../../src/screens/games/FirstPointScreen'
import { GameFactory } from '../../test-data/game'
import { NavigationContainer } from '@react-navigation/native'
import { PointFactory } from '../../test-data/point'
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

const navigate = jest.fn()
const reset = jest.fn()
const game = GameFactory.build()

const props: FirstPointProps = {
    navigation: {
        navigate,
        reset,
    } as any,
    route: { params: { gameId: game._id, team: 'one' } } as any,
}

const client = new QueryClient()
describe('FirstPointScreen', () => {
    it('renders', () => {
        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <FirstPointScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Game', { ...game, offline: false })
                    })
                },
            ),
        )
        expect(screen.getByText(game.resolveCode)).not.toBeNull()
        expect(screen.getByText('PULLING')).toBeTruthy()
        expect(screen.getByText('RECEIVING')).toBeTruthy()
        expect(screen.getByText('start')).toBeTruthy()
    })

    it('should handle start', async () => {
        jest.spyOn(PointNetwork, 'nextPoint').mockReturnValueOnce(
            Promise.resolve({
                data: { point: PointFactory.build() },
                status: 201,
                statusText: 'Point created',
            } as AxiosResponse),
        )
        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <FirstPointScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Game', { ...game, offline: false })
                    })
                },
            ),
        )

        const pullBtn = screen.getByText('RECEIVING')
        fireEvent.press(pullBtn)

        const startBtn = screen.getByText('start')
        fireEvent.press(startBtn)

        await waitFor(() => {
            expect(reset).toHaveBeenCalled()
        })
    })

    it('with error', async () => {
        jest.spyOn(PointNetwork, 'nextPoint').mockReturnValueOnce(
            Promise.resolve({
                data: { message: 'Bad stuff' },
                status: 400,
                statusText: 'Bad',
            } as AxiosResponse),
        )
        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <FirstPointScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>,
                realm => {
                    realm.write(() => {
                        realm.deleteAll()
                        realm.create('Game', { ...game, offline: false })
                    })
                },
            ),
        )

        const pullBtn = screen.getByText('PULLING')
        fireEvent.press(pullBtn)

        const startBtn = screen.getByText('start')
        fireEvent.press(startBtn)

        const errorMessage = await screen.findByText('Bad stuff')
        expect(errorMessage).not.toBeNull()
    })
})
