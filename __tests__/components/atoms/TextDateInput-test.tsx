import * as React from 'react'
import TextDateInput from '../../../src/components/atoms/TextDateInput'
import { act, fireEvent, render } from '@testing-library/react-native'

import MockDate from 'mockdate'
MockDate.set('01 October 2022 00:00 UTC')

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})

afterAll(() => {
    jest.useRealTimers()
})

it('should match snapshot while closed', () => {
    const snapshot = render(
        <TextDateInput value={new Date('2022-01-01')} onChange={() => {}} />,
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should update date on confirm', async () => {
    const onChange = jest.fn()
    const { getByTestId, getByText } = render(
        <TextDateInput value={new Date('2022-01-01')} onChange={onChange} />,
    )

    const input = getByTestId('date-text-input')
    fireEvent(input, 'onPressOut')

    const confirmButton = getByText('confirm')
    fireEvent.press(confirmButton)
    await act(async () => {})

    expect(onChange).toHaveBeenCalledWith(new Date('01-01-2021'))
})

it('should not update date on confirm', async () => {
    const onChange = jest.fn()
    const { getByTestId, getByText } = render(
        <TextDateInput value={new Date('2022-01-01')} onChange={onChange} />,
    )

    const input = getByTestId('date-text-input')
    fireEvent(input, 'onPressOut')

    const confirmButton = getByText('cancel')
    fireEvent.press(confirmButton)
    await act(async () => {})

    expect(onChange).not.toHaveBeenCalled()
})
