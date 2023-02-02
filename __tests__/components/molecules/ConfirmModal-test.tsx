import ConfirmModal from '../../../src/components/molecules/ConfirmModal'
import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

describe('ConfirmModal', () => {
    it('renders correctly', () => {
        const { getByText } = render(
            <ConfirmModal
                displayText="confirm this?"
                visible={true}
                loading={false}
                onConfirm={async () => {}}
                onClose={async () => {}}
                onCancel={async () => {}}
            />,
        )

        expect(getByText('confirm this?')).toBeTruthy()
        expect(getByText('confirm')).toBeTruthy()
        expect(getByText('cancel')).toBeTruthy()
    })

    it('calls callbacks', () => {
        const onConfirm = jest.fn()
        const onCancel = jest.fn()
        const { getByText } = render(
            <ConfirmModal
                displayText="confirm this?"
                visible={true}
                loading={false}
                onConfirm={onConfirm}
                onClose={async () => {}}
                onCancel={onCancel}
            />,
        )

        const confirmBtn = getByText('confirm')
        const cancelBtn = getByText('cancel')
        fireEvent.press(confirmBtn)
        expect(onConfirm).toHaveBeenCalled()
        fireEvent.press(cancelBtn)
        expect(onCancel).toHaveBeenCalled()
    })
})
