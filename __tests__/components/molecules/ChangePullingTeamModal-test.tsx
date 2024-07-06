import ChangePullingTeamModal from '../../../src/components/molecules/ChangePullingTeamModal'
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
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <ChangePullingTeamModal
                        visible={true}
                        onClose={jest.fn()}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText(game.teamOne.name)).toBeTruthy()
        expect(screen.getByText(game.teamTwo.name)).toBeTruthy()
    })

    it('handles submit', async () => {
        const onClose = jest.fn()

        render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <ChangePullingTeamModal visible={true} onClose={onClose} />
                </QueryClientProvider>
            </Provider>,
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
