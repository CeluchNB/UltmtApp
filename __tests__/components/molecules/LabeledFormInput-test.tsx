import LabeledFormInput from '../../../src/components/molecules/LabeledFormInput'
import React from 'react'
import { Text } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'

const onChange = jest.fn()
const props = {
    label: 'Test field',
    value: '',
    unit: 'players',
    error: 'test error',
    onChange,
}
beforeEach(() => {
    onChange.mockClear()
})

describe('LabeledFormInput', () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('should match basic snapshot', () => {
        const snapshot = render(<LabeledFormInput {...props} />)
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should match snapshot without unit', () => {
        const snapshot = render(
            <LabeledFormInput {...props} unit={undefined} />,
        )
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should match snapshot with non-user input', () => {
        const snapshot = render(
            <LabeledFormInput {...props}>
                <Text>Test display</Text>
            </LabeledFormInput>,
        )
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('text change should fire prop method', () => {
        const { getByPlaceholderText } = render(<LabeledFormInput {...props} />)

        const input = getByPlaceholderText('Test field')

        fireEvent.changeText(input, 'test')
        expect(onChange).toHaveBeenCalledWith('test')
    })
})
