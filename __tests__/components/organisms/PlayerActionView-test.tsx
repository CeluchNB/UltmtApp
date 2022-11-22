import { ActionType } from '../../../src/types/action'
import { GuestUser } from '../../../src/types/user'
import PlayerActionView from '../../../src/components/organisms/PlayerActionView'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../../src/store/store'
import { fireEvent, render } from '@testing-library/react-native'

const playerList1: GuestUser[] = [
    { firstName: 'First 1', lastName: 'Last 1' },
    { firstName: 'First 2', lastName: 'Last 2' },
    { firstName: 'First 3', lastName: 'Last 3' },
    { firstName: 'First 4', lastName: 'Last 4' },
    { firstName: 'First 5', lastName: 'Last 5' },
    { firstName: 'First 6', lastName: 'Last 6' },
    { firstName: 'First 7', lastName: 'Last 7' },
]

it('should match snapshot', () => {
    const snapshot = render(
        <Provider store={store}>
            <PlayerActionView
                players={playerList1}
                pulling={false}
                undoDisabled={false}
                loading={true}
                onAction={jest.fn()}
                onUndo={jest.fn()}
                prevAction={ActionType.CATCH}
                activePlayer={2}
            />
        </Provider>,
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should call undo', () => {
    const undoFn = jest.fn()
    const { getByTestId } = render(
        <Provider store={store}>
            <PlayerActionView
                players={playerList1}
                pulling={false}
                undoDisabled={false}
                loading={true}
                onAction={jest.fn()}
                onUndo={undoFn}
                prevAction={ActionType.CATCH}
                activePlayer={2}
            />
        </Provider>,
    )

    const undoBtn = getByTestId('undo-button')
    fireEvent.press(undoBtn)

    expect(undoFn).toHaveBeenCalled()
})

it('should call action', () => {
    const actionFn = jest.fn()
    const { getAllByText } = render(
        <Provider store={store}>
            <PlayerActionView
                players={playerList1}
                pulling={false}
                undoDisabled={false}
                loading={true}
                onAction={actionFn}
                onUndo={jest.fn()}
                prevAction={ActionType.CATCH}
                activePlayer={2}
            />
        </Provider>,
    )

    const catchBtn = getAllByText(ActionType.CATCH)[0]
    fireEvent.press(catchBtn)

    expect(actionFn).toHaveBeenCalledWith(0, ActionType.CATCH, [])
})
