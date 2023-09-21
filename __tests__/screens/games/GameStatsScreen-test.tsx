import * as GameData from '../../../src/services/data/game'
import { GameStatsProps } from '../../../src/types/navigation'
import GameStatsScreen from '../../../src/screens/games/GameStatsScreen'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { game } from '../../../fixtures/data'
import { QueryClient, QueryClientProvider } from 'react-query'
import { render, screen, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('react-native-gifted-charts', () => {
    return {
        BarChart: () => {},
        __esModule: true,
    }
})

const props: GameStatsProps = {
    navigation: {} as any,
    route: { params: { gameId: 'game1' } } as any,
}

const client = new QueryClient()

describe('GameStatsScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders game and tab view', async () => {
        const spy = jest
            .spyOn(GameData, 'getGameById')
            .mockReturnValue(Promise.resolve(game))
        render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <GameStatsScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(spy).toHaveBeenCalled()
        })
        expect(screen.getAllByText(game.teamOne.name).length).toBeGreaterThan(1)
        expect(screen.getAllByText(game.teamTwo.name).length).toBeGreaterThan(1)
        expect(screen.getByText('Leaderboard')).toBeTruthy()
        expect(screen.getByText('Game Overview')).toBeTruthy()
    })
})
