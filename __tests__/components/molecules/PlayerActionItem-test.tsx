import { ActionType } from '../../../src/types/action'
import PlayerActionItem from '../../../src/components/molecules/PlayerActionItem'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../../src/store/store'
import { fireEvent, render } from '@testing-library/react-native'

it('should match snapshot', () => {
    const snapshot = render(
        <Provider store={store}>
            <PlayerActionItem
                player={{
                    firstName: 'First',
                    lastName: 'Last',
                    username: 'firstlast',
                }}
                actions={[ActionType.BLOCK, ActionType.CATCH, 'score']}
                onAction={jest.fn()}
            />
        </Provider>,
    )
    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should call action appropriately', () => {
    const spy = jest.fn()
    const { getByText } = render(
        <Provider store={store}>
            <PlayerActionItem
                player={{ firstName: 'First', lastName: 'Last' }}
                actions={[ActionType.BLOCK, ActionType.CATCH, 'score']}
                onAction={spy}
            />
        </Provider>,
    )

    const scoreBtn = getByText('score')
    fireEvent.press(scoreBtn)
    expect(spy).toHaveBeenCalledWith('score', [])
})
