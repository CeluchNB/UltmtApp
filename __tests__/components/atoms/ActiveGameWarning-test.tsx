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
        const { container: nullContainer } = render(
            <ActiveGameWarning onPress={jest.fn()} />,
        )

        expect(nullContainer.children[0]).toBeUndefined()

        const { container: zeroContainer } = render(
            <ActiveGameWarning count={0} onPress={jest.fn()} />,
        )

        expect(zeroContainer.children[0]).toBeUndefined()
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
