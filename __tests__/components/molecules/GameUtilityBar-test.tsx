import GameUtilityBar from '../../../src/components/molecules/GameUtilityBar'
import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

describe('GameUtilityBar', () => {
    it('renders with all actions', () => {
        const snapshot = render(
            <GameUtilityBar
                onReactivateGame={() => {}}
                onDeleteGame={() => {}}
                totalViews={5}
                loading={false}
            />,
        )

        expect(snapshot).toMatchSnapshot()
    })

    it('calls reactivate function', () => {
        const onReactivateGame = jest.fn()
        const { getByTestId } = render(
            <GameUtilityBar
                onReactivateGame={onReactivateGame}
                loading={false}
            />,
        )

        fireEvent.press(getByTestId('reactivate-button'))
        expect(onReactivateGame).toHaveBeenCalled()
    })

    it('calls delete function', () => {
        const onDeleteGame = jest.fn()
        const { getByTestId } = render(
            <GameUtilityBar onDeleteGame={onDeleteGame} loading={false} />,
        )

        fireEvent.press(getByTestId('delete-button'))
        expect(onDeleteGame).toHaveBeenCalled()
    })
})
