import GameUtilityBar from '../../../src/components/molecules/GameUtilityBar'
import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

describe('GameUtilityBar', () => {
    it('renders with all actions', () => {
        const snapshot = render(<GameUtilityBar onReactivateGame={() => {}} />)

        expect(snapshot).toMatchSnapshot()
    })

    it('calls reactivate function', () => {
        const onReactivateGame = jest.fn()
        const { getByTestId } = render(
            <GameUtilityBar onReactivateGame={onReactivateGame} />,
        )

        fireEvent.press(getByTestId('reactivate-button'))
        expect(onReactivateGame).toHaveBeenCalled()
    })
})
