import FilterModal from '../../../src/components/molecules/FilterModal'
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'

import MockDate from 'mockdate'
MockDate.set('01 October 2022 00:00 UTC')

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

it('should match snapshot', () => {
    const snapshot = render(
        <FilterModal
            visible={true}
            defaultValues={{
                live: 'true',
                after: new Date(),
                before: new Date(),
            }}
            onClose={() => {}}
        />,
    )

    expect(snapshot).toMatchSnapshot()
})

it('should call on close with correct data', async () => {
    const onClose = jest.fn()
    const { getByText } = render(
        <FilterModal
            visible={true}
            defaultValues={{
                live: 'true',
                after: new Date('2022-01-01'),
                before: new Date('2022-06-01'),
            }}
            onClose={onClose}
        />,
    )

    const doneBtn = getByText('done')
    fireEvent.press(doneBtn)
    await act(async () => {})

    expect(onClose).toBeCalled()
})

// it('should handle clear press', async () => {
//     const onClose = jest.fn()
//     const { getByText, getAllByTestId, getByPlaceholderText } = render(
//         <FilterModal
//             visible={true}
//             defaultValues={{
//                 live: 'true',
//                 after: new Date('2022-01-01'),
//                 before: new Date('2022-06-01'),
//             }}
//             onClose={onClose}
//         />,
//     )

//     const textInput = getAllByTestId('date-text-input')
//     fireEvent.changeText(textInput[0], '1970-01-01')

//     const clearBtn = getByText('clear')
//     fireEvent.press(clearBtn)

//     expect(getByPlaceholderText('1/1/2022')).not.toBeNull()
// })

it('should close on request close', () => {
    const onClose = jest.fn()
    const { getByTestId } = render(
        <FilterModal
            visible={true}
            defaultValues={{
                live: 'true',
                after: new Date('2022-01-02'),
                before: new Date('2022-06-01'),
            }}
            onClose={onClose}
        />,
    )

    const modal = getByTestId('base-modal')
    fireEvent(modal, 'onRequestClose')

    expect(onClose).toHaveBeenCalled()
})
