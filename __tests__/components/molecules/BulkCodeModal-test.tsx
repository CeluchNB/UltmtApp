import * as React from 'react'
import BulkCodeModal from '../../../src/components/molecules/BulkCodeModal'
import renderer from 'react-test-renderer'
import { fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

it('should match snapshot when visible', async () => {
    const snapshot = renderer.create(
        <BulkCodeModal
            code="123456"
            error=""
            visible={true}
            onClose={() => {}}
        />,
    )

    expect(snapshot).toMatchSnapshot()
})

it('should match snapshot with error', async () => {
    const snapshot = renderer.create(
        <BulkCodeModal
            code=""
            error="Bulk code error"
            visible={true}
            onClose={() => {}}
        />,
    )

    expect(snapshot).toMatchSnapshot()
})

it('should handle close click', async () => {
    const spy = jest.fn()
    const { getByText } = render(
        <BulkCodeModal
            code=""
            error="Bulk code error"
            visible={true}
            onClose={spy}
        />,
    )

    const button = getByText('done')
    fireEvent.press(button)

    expect(spy).toHaveBeenCalled()
})
