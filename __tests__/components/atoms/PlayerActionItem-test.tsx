import { ActionType } from '../../../src/types/action'
import PlayerActionItem from '../../../src/components/atoms/PlayerActionItem'
import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

it('should match snapshot', () => {
    const snapshot = render(
        <PlayerActionItem
            player={{
                firstName: 'First',
                lastName: 'Last',
                username: 'firstlast',
            }}
            actions={[ActionType.BLOCK, ActionType.CATCH, 'score']}
            onAction={jest.fn()}
        />,
    )
    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should call action appropriately', () => {
    const spy = jest.fn()
    const { getByText } = render(
        <PlayerActionItem
            player={{ firstName: 'First', lastName: 'Last' }}
            actions={[ActionType.BLOCK, ActionType.CATCH, 'score']}
            onAction={spy}
        />,
    )

    const scoreBtn = getByText('score')
    fireEvent.press(scoreBtn)
    expect(spy).toHaveBeenCalledWith('score')
})
