import * as React from 'react'
import GameListItem from '../../../src/components/atoms/GameListItem'
import { game } from '../../../fixtures/data'
import renderer from 'react-test-renderer'
import { fireEvent, render } from '@testing-library/react-native'

describe('GameListItem', () => {
    it('test matches snapshot', () => {
        const snapshot = renderer.create(
            <GameListItem game={game} teamId={game.teamOne._id} />,
        )

        expect(snapshot).toMatchSnapshot()
    })

    it('displays correct view', () => {
        const { getByText } = render(
            <GameListItem game={game} teamId={game.teamOne._id} />,
        )

        const teamDisplay = getByText(`vs. ${game.teamTwo.name}`)
        const scoreDisplay = getByText(
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
