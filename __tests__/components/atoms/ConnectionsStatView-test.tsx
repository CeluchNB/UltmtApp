import ConnectionsStatView from '../../../src/components/atoms/ConnectionsStatView'
import React from 'react'
import { render, screen } from '@testing-library/react-native'

describe('ConnectionsStatView', () => {
    it('renders correctly with data', () => {
        render(
            <ConnectionsStatView
                loading={false}
                connection={{
                    throwerId: 'thrower',
                    receiverId: 'receiver',
                    catches: 1,
                    scores: 2,
                    drops: 3,
                }}
            />,
        )

        expect(screen.getByText('1')).toBeTruthy()
        expect(screen.getByText('Catches')).toBeTruthy()
        expect(screen.getByText('2')).toBeTruthy()
        expect(screen.getByText('Scores')).toBeTruthy()
        expect(screen.getByText('3')).toBeTruthy()
        expect(screen.getByText('Drops')).toBeTruthy()
    })

    it('renders correctly in loading state', () => {
        render(<ConnectionsStatView loading={true} />)
        expect(
            screen.getByTestId('connections-activity-indicator'),
        ).toBeTruthy()
    })

    it('renders correctly in error state with player names', () => {
        render(
            <ConnectionsStatView
                loading={false}
                playerOne="Test One"
                playerTwo="Test Two"
            />,
        )
        expect(
            screen.getByText('No connections from Test One to Test Two'),
        ).toBeTruthy()
    })

    it('renders correctly in error state without player names', () => {
        render(<ConnectionsStatView loading={false} />)
        expect(
            screen.getByText('No connections from Player One to Player Two'),
        ).toBeTruthy()
    })
})
