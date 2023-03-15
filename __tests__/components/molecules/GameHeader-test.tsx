import GameHeader from '../../../src/components/molecules/GameHeader'
import React from 'react'
import { game } from '../../../fixtures/data'
import { fireEvent, render, screen } from '@testing-library/react-native'

describe('Game Header', () => {
    it('should match snapshot', () => {
        const snapshot = render(<GameHeader game={game} />)
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should match snapshot with no description', () => {
        const snapshot = render(
            <GameHeader
                game={{ ...game, teamOneActive: false, teamTwoActive: false }}
            />,
        )
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should display extra info', () => {
        render(<GameHeader header game={game} />)
        const button = screen.getByText('show info')
        fireEvent.press(button)

        expect(
            screen.getByText(`Softcap At: ${game.softcapMins} min`),
        ).toBeTruthy()
    })

    it('should hide extra info', () => {
        render(<GameHeader header game={game} />)
        const showButton = screen.getByText('show info')
        fireEvent.press(showButton)

        const hideButton = screen.getByText('hide info')
        fireEvent.press(hideButton)

        expect(
            screen.queryByText(`Softcap At: ${game.softcapMins} min`),
        ).toBeNull()
    })
})
