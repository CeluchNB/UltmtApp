import ActiveGameWarning from '../../../src/components/atoms/ActiveGameWarning'
import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

describe('ActiveGameWarning', () => {
    it('renders with postive value', () => {
        const { getByText } = render(
            <ActiveGameWarning count={4} onPress={jest.fn()} />,
        )

        expect(getByText('You have 4 active games')).toBeTruthy()
    })

    it('renders with no value', () => {
        const { queryByTestId: queryFirst } = render(
            <ActiveGameWarning onPress={jest.fn()} />,
        )

        expect(queryFirst('active-warning-chip')).toBeNull()

        const { queryByTestId: querySecond } = render(
            <ActiveGameWarning count={0} onPress={jest.fn()} />,
        )

        expect(querySecond('active-warning-chip')).toBeNull()
    })

    it('handles on press', () => {
        const onPress = jest.fn()
        const { getByText, getByTestId } = render(
            <ActiveGameWarning count={1} onPress={onPress} />,
        )
        const text = getByText('You have 1 active game')
        fireEvent.press(text)
        expect(onPress).toHaveBeenCalled()

        const icon = getByTestId('chip-close')
        fireEvent.press(icon)
        expect(onPress).toHaveBeenCalledTimes(2)
    })
})
