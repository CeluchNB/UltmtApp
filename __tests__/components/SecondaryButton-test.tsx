import React from 'react'
import SecondaryButton from '../../src/components/SecondaryButton'
import { fireEvent, render } from '@testing-library/react-native'

import renderer from 'react-test-renderer'

it('test match snapshot', () => {
    const tree = renderer
        .create(<SecondaryButton text="Text" onPress={() => ({})} />)
        .toJSON()

    expect(tree).toMatchSnapshot()
})

it('test button displayed', () => {
    const { getByText } = render(
        <SecondaryButton text="Text" onPress={() => ({})} />,
    )

    expect(getByText('Text')).toBeDefined()
})

it('test submit function called', () => {
    const mockFn = jest.fn()
    const { getByText } = render(
        <SecondaryButton text="Text" onPress={mockFn} />,
    )

    fireEvent.press(getByText('Text'))

    expect(mockFn).toBeCalledTimes(1)
})
