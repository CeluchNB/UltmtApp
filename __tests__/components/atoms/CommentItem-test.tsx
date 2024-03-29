import CommentItem from '../../../src/components/atoms/CommentItem'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'

describe('CommentItem', () => {
    const props = {
        comment: {
            commentNumber: 1,
            comment: 'Test comment',
            user: {
                _id: '',
                firstName: 'First1',
                lastName: 'Last1',
                username: 'firstlast1',
            },
        },
        userId: 'user1',
        onDelete: jest.fn(),
        onPress: jest.fn(),
    }

    it('should match snapshot', () => {
        const snapshot = render(<CommentItem {...props} />)
        expect(snapshot).toMatchSnapshot()
    })

    it('should handle delete', () => {
        const { getByRole } = render(
            <CommentItem
                {...props}
                comment={{
                    commentNumber: 1,
                    comment: 'Test comment',
                    user: {
                        _id: 'user1',
                        firstName: 'First1',
                        lastName: 'Last1',
                        username: 'firstlast1',
                    },
                }}
            />,
        )

        const button = getByRole('button')
        expect(button).toBeTruthy()

        fireEvent.press(button)
        expect(props.onDelete).toHaveBeenCalledWith(props.comment.commentNumber)
    })

    it('should handle press', () => {
        render(
            <CommentItem
                {...props}
                comment={{
                    commentNumber: 1,
                    comment: 'Test comment',
                    user: {
                        _id: 'user1',
                        firstName: 'First1',
                        lastName: 'Last1',
                        username: 'firstlast1',
                    },
                }}
            />,
        )

        const userDisplay = screen.getByText('First1 Last1')

        fireEvent.press(userDisplay)
        expect(props.onPress).toHaveBeenCalledWith('user1')
    })
})
