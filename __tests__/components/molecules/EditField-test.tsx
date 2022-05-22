import '@testing-library/jest-native/extend-expect'
import * as React from 'react'
import EditField from '../../../src/components/molecules/EditField'
import { fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

it('should match snapshot', () => {
    const snapshot = render(
        <EditField label="test" value="test" onSubmit={async () => {}} />,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should toggle with edit button', async () => {
    const spy = jest.fn()

    const { getByTestId, queryByTestId, queryByPlaceholderText } = render(
        <EditField label="test" value="test" onSubmit={spy} />,
    )

    const submitButton1 = await queryByTestId('ef-submit-button')
    expect(submitButton1).toBeNull()
    const input1 = await queryByPlaceholderText('test')
    expect(input1).toBeNull()

    const editButton = getByTestId('ef-edit-button')
    fireEvent.press(editButton)

    const submitButton2 = await queryByTestId('ef-submit-button')
    expect(submitButton2).not.toBeNull()
    const input2 = await queryByPlaceholderText('test')
    expect(input2).not.toBeNull()

    fireEvent.press(editButton)

    const submitButton3 = await queryByTestId('ef-submit-button')
    expect(submitButton3).toBeNull()
    const input3 = await queryByPlaceholderText('test')
    expect(input3).toBeNull()
})

it('should call custom edit function', async () => {
    const editSpy = jest.fn()
    const submitSpy = jest.fn()

    const { getByTestId, queryByPlaceholderText } = render(
        <EditField
            label="test"
            value="test"
            onSubmit={submitSpy}
            onEdit={editSpy}
        />,
    )

    const editButton = getByTestId('ef-edit-button')
    fireEvent.press(editButton)

    expect(editSpy).toHaveBeenCalled()

    const input = await queryByPlaceholderText('test')
    expect(input).toBeNull()
})

it('test on submit called', async () => {
    const spy = jest.fn()

    const { getByTestId } = render(
        <EditField label="test" value="test" onSubmit={spy} />,
    )

    const editButton = getByTestId('ef-edit-button')
    fireEvent.press(editButton)

    const submitButton2 = getByTestId('ef-submit-button')
    fireEvent.press(submitButton2)

    expect(spy).toHaveBeenCalled()
})
