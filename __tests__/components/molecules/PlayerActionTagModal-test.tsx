import PlayerActionTagModal from '../../../src/components/molecules/PlayerActionTagModal'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../../src/store/store'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

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
            <PlayerActionTagModal visible={true} onClose={jest.fn()} />
        </Provider>,
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should add tag correctly', async () => {
    const { getByPlaceholderText, getByText } = render(
        <Provider store={store}>
            <PlayerActionTagModal visible={true} onClose={jest.fn()} />
        </Provider>,
    )

    const tagInput = getByPlaceholderText('New tag...')
    fireEvent.changeText(tagInput, 'test')

    const addBtn = getByText('add')
    fireEvent.press(addBtn)

    await waitFor(() => {
        expect(getByText('test')).toBeTruthy()
    })
})

it('should call close correctly', async () => {
    const onClose = jest.fn()
    const { getByText } = render(
        <Provider store={store}>
            <PlayerActionTagModal visible={true} onClose={onClose} />
        </Provider>,
    )

    const huckBtn = getByText('huck')
    fireEvent.press(huckBtn)

    const doneBtn = getByText('done')
    fireEvent.press(doneBtn)
    await act(async () => {})

    expect(onClose).toBeCalledWith(['huck'])
})
