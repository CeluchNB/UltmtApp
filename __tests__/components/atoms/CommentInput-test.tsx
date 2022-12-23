import '@testing-library/jest-native/extend-expect'
import CommentInput from '../../../src/components/atoms/CommentInput'
import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

describe('CommentInput', () => {
    it('should display blank state', () => {
        const onSend = jest.fn()
        const { getByRole, getByText, getByPlaceholderText } = render(
            <CommentInput
                loading={false}
                error=""
                isLoggedIn={true}
                onSend={onSend}
            />,
        )

        expect(getByRole('button')).toBeDisabled()
        expect(getByPlaceholderText('Add a comment...')).toBeTruthy()
        expect(getByText('0 / 160')).toBeTruthy()
    })

    it('should display unauth state', () => {
        const onSend = jest.fn()
        const { getByText, queryByRole } = render(
            <CommentInput
                loading={false}
                error=""
                isLoggedIn={false}
                onSend={onSend}
            />,
        )

        expect(getByText('Log in to leave a comment')).toBeTruthy()
        expect(queryByRole('button')).toBeFalsy()
    })

    it('should display error', () => {
        const onSend = jest.fn()
        const { getByText } = render(
            <CommentInput
                loading={false}
                error="This is an error"
                isLoggedIn={true}
                onSend={onSend}
            />,
        )

        expect(getByText('This is an error')).toBeTruthy()
    })

    it('should handle comment submit', async () => {
        const onSend = jest.fn()
        const { getByRole, getByPlaceholderText, getByText } = render(
            <CommentInput
                loading={false}
                error=""
                isLoggedIn={true}
                onSend={onSend}
            />,
        )

        const input = getByPlaceholderText('Add a comment...')
        fireEvent.changeText(input, 'Test')

        expect(getByText('4 / 160')).toBeTruthy()
        const button = getByRole('button')
        expect(button).not.toBeDisabled()
        fireEvent.press(button)

        await waitFor(() => {
            expect(onSend).toHaveBeenCalledWith('Test')
        })
    })

    it('should handle long comment', async () => {
        const longComment = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sem mi, pulvinar in aliquam eu, pretium ac purus. Praesent sed scelerisque metus. In fringilla dui varius, interdum nibh quis, fringilla ex. Donec nec blandit orci, non vestibulum purus. Suspendisse potenti. Aenean erat erat, luctus ut sem condimentum, commodo rutrum elit. Vivamus sit amet ante massa.`
        const onSend = jest.fn()
        const { getByRole, getByPlaceholderText } = render(
            <CommentInput
                loading={false}
                error=""
                isLoggedIn={true}
                onSend={onSend}
            />,
        )

        const input = getByPlaceholderText('Add a comment...')
        fireEvent.changeText(input, longComment)

        const button = getByRole('button')
        expect(button).toBeDisabled()
        fireEvent.press(button)

        await waitFor(() => {
            expect(onSend).not.toHaveBeenCalled()
        })
    })
})
