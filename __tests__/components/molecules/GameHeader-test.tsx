import GameHeader from '../../../src/components/molecules/GameHeader'
import React from 'react'
import { game } from '../../../fixtures/data'
import { render } from '@testing-library/react-native'

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
