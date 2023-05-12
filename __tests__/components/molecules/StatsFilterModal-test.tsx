import React from 'react'
import StatsFilterModal from '../../../src/components/molecules/StatsFilterModal'
import { fireEvent, render, screen } from '@testing-library/react-native'

const onSelect = jest.fn()
const onDone = jest.fn()
const onClear = jest.fn()

describe('StatsFilterModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders correctly', () => {
        render(
            <StatsFilterModal
                title="Title"
                data={[{ display: 'Item 1', value: 'item1', checked: false }]}
                visible={true}
                onSelect={onSelect}
                onDone={onDone}
                onClear={onClear}
            />,
        )

        expect(screen.getByText('Title')).toBeTruthy()
        expect(screen.getByText('Item 1')).toBeTruthy()
        expect(screen.getByText('done')).toBeTruthy()
    })

    it('calls onDone', () => {
        render(
            <StatsFilterModal
                title="Title"
                data={[{ display: 'Item 1', value: 'item1', checked: false }]}
                visible={true}
                onSelect={onSelect}
                onDone={onDone}
                onClear={onClear}
            />,
        )

        const doneBtn = screen.getByText('done')
        fireEvent.press(doneBtn)
        expect(onDone).toHaveBeenCalledTimes(1)
    })

    it('calls onClear', () => {
        render(
            <StatsFilterModal
                title="Title"
                data={[{ display: 'Item 1', value: 'item1', checked: false }]}
                visible={true}
                onSelect={onSelect}
                onDone={onDone}
                onClear={onClear}
            />,
        )

        const clearBtn = screen.getByText('clear')
        fireEvent.press(clearBtn)
        expect(onClear).toHaveBeenCalledTimes(1)
    })

    it('calls onSelect', () => {
        render(
            <StatsFilterModal
                title="Title"
                data={[{ display: 'Item 1', value: 'item1', checked: false }]}
                visible={true}
                onSelect={onSelect}
                onDone={onDone}
                onClear={onClear}
            />,
        )

        const checkbox = screen.getByTestId('checkbox-0')
        fireEvent(checkbox, 'onChange')
        expect(onSelect).toHaveBeenCalledTimes(1)
        expect(onSelect).toHaveBeenCalledWith('item1')
    })
})
