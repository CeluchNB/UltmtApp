import React from 'react'
import GameCard, { GameCardProps } from '../../../src/components/atoms/GameCard'
import { fireEvent, render } from '@testing-library/react-native'
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

let props: GameCardProps
const fn = jest.fn()

beforeEach(() => {
    props = {
        id: 'game1',
        teamOne: {
            _id: 'team1',
            place: 'Place 1',
            name: 'Name 1',
            teamname: 'placename1',
            seasonStart: '2022',
            seasonEnd: '2022',
        },
        teamTwo: {
            _id: 'team2',
            place: 'Place 2',
            name: 'Name 2',
            teamname: 'placename2',
        },
        teamOneScore: 10,
        teamTwoScore: 7,
        scoreLimit: 15,
        onPress: fn,
    }
})

it('should match snapshot', () => {
    const snapshot = render(<GameCard {...props} />)

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should press', () => {
    const { getByTestId } = render(<GameCard {...props} />)
    const pressable = getByTestId('game-card-pressable')
    fireEvent.press(pressable)
    expect(fn).toHaveBeenCalled()
})
