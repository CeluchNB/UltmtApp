import * as StatsData from '../../../src/services/data/stats'
import PlayerConnectionsView from '../../../src/components/organisms/PlayerConnectionsView'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { render, screen } from '@testing-library/react-native'

jest.mock('react-native-element-dropdown', () => {
    return {
        Dropdown: () => <span>dropdown</span>,
    }
})

const client = new QueryClient()

describe('PlayerConnectionView', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    const players = [
        { firstName: 'First 1', lastName: 'Last 1', playerId: 'player1' },
        { firstName: 'First 2', lastName: 'Last 2', playerId: 'player2' },
    ]
    it('renders correctly', () => {
        jest.spyOn(StatsData, 'filterConnectionStats').mockReturnValue(
            Promise.resolve({
                throwerId: 'thrower',
                receiverId: 'receiver',
                catches: 1,
                scores: 1,
                drops: 1,
            }),
        )
        jest.spyOn(StatsData, 'getConnectionStats').mockReturnValue(
            Promise.resolve({
                throwerId: 'thrower',
                receiverId: 'receiver',
                catches: 1,
                scores: 1,
                drops: 1,
            }),
        )

        render(
            <QueryClientProvider client={client}>
                <PlayerConnectionsView players={players} />
            </QueryClientProvider>,
        )

        expect(screen.getByText('Player Connections')).toBeTruthy()
        expect(screen.getByText('to')).toBeTruthy()
    })
})
