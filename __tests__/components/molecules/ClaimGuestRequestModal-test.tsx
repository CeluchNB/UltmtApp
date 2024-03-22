import ClaimGuestRequestModal from '../../../src/components/molecules/ClaimGuestRequestModal'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'

describe('ClaimGuestRequestModal', () => {
    it('on request is called', async () => {
        const onRequest = jest.fn()
        render(
            <ClaimGuestRequestModal
                visible={true}
                loading={false}
                onClose={async () => {}}
                onRequest={onRequest}
            />,
        )

        const requestBtn = screen.getByText('request')
        fireEvent.press(requestBtn)

        expect(onRequest).toHaveBeenCalled()
    })

    it('on close is called', async () => {
        const onClose = jest.fn()
        render(
            <ClaimGuestRequestModal
                visible={true}
                loading={false}
                onClose={onClose}
                onRequest={async () => {}}
            />,
        )

        const closeBtn = screen.getByText('close')
        fireEvent.press(closeBtn)

        expect(onClose).toHaveBeenCalled()
    })

    it('success and error messages display', async () => {
        render(
            <ClaimGuestRequestModal
                visible={true}
                loading={false}
                successMessage="success"
                errorMessage="error"
                onClose={async () => {}}
                onRequest={async () => {}}
            />,
        )

        expect(screen.getByText('success')).toBeTruthy()
        expect(screen.getByText('error')).toBeTruthy()
    })
})
