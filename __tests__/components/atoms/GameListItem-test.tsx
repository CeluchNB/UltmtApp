import * as React from 'react'
import { DisplayGame } from '../../../src/types/game'
import { DisplayTeam } from '../../../src/types/team'
import GameListItem from '../../../src/components/atoms/GameListItem'
import { render } from '@testing-library/react-native'
import renderer from 'react-test-renderer'

const game: DisplayGame = {
    opponent: {
        _id: 'id1',
        place: 'Place1',
        name: 'Name1',
        seasonStart: '2019',
        seasonEnd: '2019',
    } as DisplayTeam,
    teamScore: 15,
    opponentScore: 14,
}

it('test matches snapshot', () => {
    const snapshot = renderer.create(<GameListItem game={game} />)

    expect(snapshot).toMatchSnapshot()
})

it('displays correct view', () => {
    const { getByText } = render(<GameListItem game={game} />)

    const teamDisplay = getByText(
        `vs. ${game.opponent.place} ${game.opponent.name}`,
    )
    const scoreDisplay = getByText(`${game.teamScore} - ${game.opponentScore}`)

    expect(teamDisplay).toBeTruthy()
    expect(scoreDisplay).toBeTruthy()
})
