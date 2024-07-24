import ChangePullingTeamModal from '../../../src/components/molecules/ChangePullingTeamModal'
import LiveGameProvider from '../../../src/context/live-game-context'
import { NavigationContainer } from '@react-navigation/native'
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

const client = new QueryClient()

describe('ChangePullingTeamModal', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('displays correctly', () => {
        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <LiveGameProvider gameId={game._id}>
                            <ChangePullingTeamModal
                                visible={true}
                                onClose={jest.fn()}
                            />
                        </LiveGameProvider>
                    </QueryClientProvider>
                </NavigationContainer>,
            ),
        )

        expect(screen.getByText(game.teamOne.name)).toBeTruthy()
        expect(screen.getByText(game.teamTwo.name)).toBeTruthy()
    })

    it('handles submit', async () => {
        const onClose = jest.fn()

        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <LiveGameProvider gameId={game._id}>
                            <ChangePullingTeamModal
                                visible={true}
                                onClose={onClose}
                            />
                        </LiveGameProvider>
                    </QueryClientProvider>
                </NavigationContainer>,
            ),
        )

        // press team one first
        const teamOne = screen.getByText(game.teamOne.name)
        fireEvent.press(teamOne)

        const teamTwo = screen.getByText(game.teamTwo.name)
        fireEvent.press(teamTwo)

        const submitBtn = screen.getByText('submit')
        fireEvent.press(submitBtn)

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled()
        })
    })
})
