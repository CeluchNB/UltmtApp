import React from 'react'
import StatFilterChip from '../../../src/components/atoms/StatFilterChip'
import { fireEvent, render, screen } from '@testing-library/react-native'

describe('StatFilterChip', () => {
    it('renders properly unselected', () => {
        render(
            <StatFilterChip
                name="Test Chip"
                selected={false}
                onPress={jest.fn()}
            />,
        )
        expect(screen.getByText('Test Chip')).toBeTruthy()
    })

    it('renders properly selected', () => {
        render(
            <StatFilterChip
                name="Test Chip"
                selected={true}
                onPress={jest.fn()}
            />,
        )
        expect(screen.getByText('Test Chip')).toBeTruthy()
    })

    it('calls onPress', () => {
        const onPress = jest.fn()
        render(
            <StatFilterChip
                name="Test Chip"
                selected={true}
                onPress={onPress}
            />,
        )

        const btn = screen.getByText('Test Chip')
        fireEvent.press(btn)

        expect(onPress).toHaveBeenCalled()
    })
})
