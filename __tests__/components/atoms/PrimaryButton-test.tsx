import PrimaryButton from '../../../src/components/atoms/PrimaryButton'
import React from 'react'
import ReactNative from 'react-native'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

import { fireEvent, render } from '@testing-library/react-native'

it('test snapshot', () => {
    const tree = renderer
        .create(
            <PrimaryButton text="Text" onPress={() => ({})} loading={false} />,
        )
        .toJSON()

    expect(tree).toMatchSnapshot()
})

it('test in dark mode', () => {
    const text = 'Text'

    const { getByText } = render(
        <PrimaryButton text={text} onPress={() => ({})} loading={false} />,
    )

    expect(getByText(text)).toBeDefined()
})

it('test text displays', () => {
    const text = 'Text'
    const { getByText } = render(
        <PrimaryButton text={text} onPress={() => ({})} loading={false} />,
    )

    expect(getByText(text)).toBeDefined()
})

it('test submit function called', () => {
    const mockFn = jest.fn()
    const { getByText } = render(
        <PrimaryButton text="Text" onPress={mockFn} loading={false} />,
    )

    fireEvent.press(getByText('Text'))

    expect(mockFn).toBeCalledTimes(1)
})
