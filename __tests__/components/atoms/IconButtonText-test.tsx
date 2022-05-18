import IconButtonText from '../../../src/components/atoms/IconButtonText'
import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

it('should match snapshot', () => {
    const snapshot = render(
        <IconButtonText text="text" icon="email-outline" onPress={() => {}} />,
    ).toJSON()
    expect(snapshot).toMatchSnapshot()
})

it('should call on press when pressing on icon', async () => {
    const spy = jest.fn()
    const { getByTestId } = render(
        <IconButtonText text="text" icon="email-outline" onPress={spy} />,
    )
    fireEvent.press(getByTestId('icon-button'))
    expect(spy).toHaveBeenCalled()
})

it('should call on press when pressing on text', async () => {
    const spy = jest.fn()
    const { getByText } = render(
        <IconButtonText text="text" icon="email-outline" onPress={spy} />,
    )
    fireEvent.press(getByText('text'))
    expect(spy).toHaveBeenCalled()
})
