import * as React from 'react'
import GameListItem from '../../../src/components/atoms/GameListItem'
import { game } from '../../../fixtures/data'
import renderer from 'react-test-renderer'
import { fireEvent, render, screen } from '@testing-library/react-native'

describe('GameListItem', () => {
    it('test matches snapshot', () => {
        const snapshot = renderer.create(
            <GameListItem game={game} teamId={game.teamOne._id} />,
        )

        expect(snapshot).toMatchSnapshot()
    })

    it('displays correct view with team id', () => {
        render(<GameListItem game={game} teamId={game.teamOne._id} />)

        const teamDisplay = screen.getByText(`vs. ${game.teamTwo.name}`)
        const scoreDisplay = screen.getByText(
            `${game.teamOneScore} - ${game.teamTwoScore}`,
        )

        expect(teamDisplay).toBeTruthy()
        expect(scoreDisplay).toBeTruthy()
    })

    it('displays correct view without team id', () => {
        render(<GameListItem game={game} />)

        const teamDisplay = screen.getByText(
            `${game.teamOne.name} vs. ${game.teamTwo.name}`,
        )
        const scoreDisplay = screen.getByText(
            `${game.teamOneScore} - ${game.teamTwoScore}`,
        )

        expect(teamDisplay).toBeTruthy()
        expect(scoreDisplay).toBeTruthy()
    })

    it('handles press', () => {
        const onPress = jest.fn()
        const { getByText } = render(
            <GameListItem
                game={game}
                teamId={game.teamOne._id}
                onPress={onPress}
            />,
        )

        const teamDisplay = getByText(`vs. ${game.teamTwo.name}`)
        fireEvent.press(teamDisplay)
        expect(onPress).toHaveBeenCalled()
    })
})
