import JoinByCodeModal from '../../../src/components/molecules/JoinByCodeModal'
import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

describe('JoinByCodeModal', () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('should match snapshot', () => {
        const snapshot = render(
            <JoinByCodeModal
                visible={true}
                onClose={jest.fn()}
                onSubmit={jest.fn()}
                error={''}
                loading={false}
            />,
        )

        expect(snapshot.getByPlaceholderText('6 Digit Code')).toBeTruthy()

        expect(snapshot).toMatchSnapshot()
    })

    it('should call on close', async () => {
        const onSubmit = jest.fn()
        const onClose = jest.fn()
        const { getByText, getByPlaceholderText } = render(
            <JoinByCodeModal
                visible={true}
                onClose={onClose}
                onSubmit={onSubmit}
                error={''}
                loading={false}
            />,
        )

        const input = getByPlaceholderText('6 Digit Code')
        fireEvent.changeText(input, '123456')

        const button = getByText('join')
        fireEvent.press(button)

        await waitFor(() => {
            expect(onSubmit).toBeCalledWith({ code: '123456' }, undefined)
        })
    })

    it('should handle error', async () => {
        const onSubmit = jest.fn()
        const onClose = jest.fn()
        const { getByText } = render(
            <JoinByCodeModal
                visible={true}
                onClose={onClose}
                onSubmit={onSubmit}
                error={''}
                loading={false}
            />,
        )

        const button = getByText('join')
        fireEvent.press(button)

        await waitFor(() => {
            expect(getByText('Code is required.')).toBeTruthy()
        })
        expect(onClose).not.toHaveBeenCalled()
        expect(onSubmit).not.toHaveBeenCalled()
    })
})
