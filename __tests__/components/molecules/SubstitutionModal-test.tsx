import { GuestUser } from '../../../src/types/user'
import { InGameStatsUserFactory } from '../../test-data/user'
import { LiveGameContext } from '../../../src/context/live-game-context'
import React from 'react'
import SubstitutionModal from '../../../src/components/molecules/SubstitutionModal'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

const originalWarn = console.warn.bind(console.warn)
beforeAll(() => {
    console.warn = msg =>
        !msg.toString().includes('flexWrap: `wrap`') && originalWarn(msg)
})
afterAll(() => {
    console.warn = originalWarn
})

const getPlayerName = (player: GuestUser) => {
    return `${player.firstName} ${player.lastName}`
}

describe('SubstitutionModal', () => {
    const players = InGameStatsUserFactory.buildList(7)
    const activePlayers = players.slice(0, 3)
    it('should match snapshot with team one', () => {
        const snapshot = render(
            <LiveGameContext.Provider
                value={{
                    team: 'one',
                    players,
                    tags: ['huck', 'break', 'layout'],
                    addTag: jest.fn(),
                    setCurrentPointNumber: jest.fn(),
                    finishGameMutation: {
                        mutate: jest.fn(),
                        isLoading: false,
                        error: null,
                        reset: jest.fn(),
                    },
                }}>
                <SubstitutionModal
                    visible={true}
                    activePlayers={activePlayers}
                    onClose={jest.fn()}
                    onSubmit={jest.fn()}
                />
            </LiveGameContext.Provider>,
        )
        expect(snapshot.getByText(getPlayerName(players[0]))).toBeTruthy()
        expect(snapshot.getByText(getPlayerName(players[1]))).toBeTruthy()
        expect(snapshot.getByText(getPlayerName(players[2]))).toBeTruthy()
        expect(snapshot.getByText(getPlayerName(players[3]))).toBeTruthy()
        expect(snapshot.getByText(getPlayerName(players[4]))).toBeTruthy()
        expect(snapshot.getByText(getPlayerName(players[5]))).toBeTruthy()
        expect(snapshot.getByText(getPlayerName(players[6]))).toBeTruthy()
    })

    it('should correctly make subsitution', async () => {
        const onSubmit = jest.fn()
        const { getByText } = render(
            <LiveGameContext.Provider
                value={{
                    team: 'one',
                    players,
                    tags: ['huck', 'break', 'layout'],
                    addTag: jest.fn(),
                    setCurrentPointNumber: jest.fn(),
                    finishGameMutation: {
                        mutate: jest.fn(),
                        isLoading: false,
                        error: null,
                        reset: jest.fn(),
                    },
                }}>
                <SubstitutionModal
                    visible={true}
                    activePlayers={activePlayers}
                    onClose={jest.fn()}
                    onSubmit={onSubmit}
                />
            </LiveGameContext.Provider>,
        )

        const playerOne = getByText(getPlayerName(players[0]))
        const playerTwo = getByText(getPlayerName(players[6]))

        fireEvent.press(playerOne)
        fireEvent.press(playerTwo)

        const submitBtn = getByText('substitute')
        fireEvent.press(submitBtn)

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining(players[0]),
                expect.objectContaining(players[6]),
            )
        })
    })
})
