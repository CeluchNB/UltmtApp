import GameFilterModal from '../../../src/components/molecules/GameFilterModal'
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'

import MockDate from 'mockdate'
MockDate.set('01 October 2022 00:00 UTC')

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})

afterAll(() => {
    jest.useRealTimers()
})

it('should match snapshot', () => {
    const snapshot = render(
        <GameFilterModal
            visible={true}
            defaultValues={{
                live: 'true',
                after: new Date(),
                before: new Date(),
                showUsers: false,
                showTeams: false,
            }}
            onClose={() => {}}
        />,
    )

    expect(snapshot).toMatchSnapshot()
})

it('should call on close with correct data', async () => {
    const onClose = jest.fn()
    const { getByText } = render(
        <GameFilterModal
            visible={true}
            defaultValues={{
                live: 'true',
                after: new Date('2022-01-01'),
                before: new Date('2022-06-01'),
                showUsers: false,
                showTeams: false,
            }}
            onClose={onClose}
        />,
    )

    const doneBtn = getByText('done')
    fireEvent.press(doneBtn)
    await act(async () => {})

    expect(onClose).toBeCalled()
})

it('should close on request close', () => {
    const onClose = jest.fn()
    const { getByTestId } = render(
        <GameFilterModal
            visible={true}
            defaultValues={{
                live: 'true',
                after: new Date('2022-01-02'),
                before: new Date('2022-06-01'),
                showUsers: false,
                showTeams: false,
            }}
            onClose={onClose}
        />,
    )

    const modal = getByTestId('base-modal')
    fireEvent(modal, 'onRequestClose')

    expect(onClose).toHaveBeenCalled()
})
