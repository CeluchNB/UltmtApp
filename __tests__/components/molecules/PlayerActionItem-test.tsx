import { ActionType } from '../../../src/types/action'
import PlayerActionItem from '../../../src/components/molecules/PlayerActionItem'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
const originalWarn = console.warn.bind(console.warn)
beforeAll(() => {
    console.warn = msg =>
        !msg.toString().includes('flexWrap: `wrap`') && originalWarn(msg)
})
afterAll(() => {
    console.warn = originalWarn
})

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

it('should handle tag call', async () => {
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
    fireEvent(scoreBtn, 'onLongPress')

    const huckBtn = getByText('huck')
    fireEvent.press(huckBtn)

    const doneBtn = getByText('done')
    fireEvent.press(doneBtn)

    await waitFor(() => {
        expect(spy).toHaveBeenCalledWith('score', ['huck'])
    })
})
