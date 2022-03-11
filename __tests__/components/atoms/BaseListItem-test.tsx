import '@testing-library/jest-native/extend-expect'
import * as React from 'react'
import { Text } from 'react-native'
import renderer from 'react-test-renderer'
import BaseListItem, {
    BaseListItemProps,
} from '../../../src/components/atoms/BaseListItem'
import { fireEvent, render } from '@testing-library/react-native'

let props: BaseListItemProps

beforeEach(() => {
    props = {
        showDelete: true,
        showAccept: true,
        onDelete: jest.fn(),
        onAccept: jest.fn(),
        onPress: jest.fn(),
        requestStatus: 'approved',
        error: undefined,
    }
})

it('test matches snapshot', () => {
    const snapshot = renderer.create(
        <BaseListItem {...props}>
            <Text>Test</Text>
        </BaseListItem>,
    )
    expect(snapshot).toMatchSnapshot()
})

it('test onpress called', () => {
    const { getByText, getByTestId } = render(
        <BaseListItem {...props}>
            <Text>test</Text>
        </BaseListItem>,
    )
    const userDisplay = getByText('test')
    fireEvent.press(userDisplay)

    const goButton = getByTestId('go-button')
    fireEvent.press(goButton)
    expect(props.onPress).toHaveBeenCalledTimes(2)
})

it('test approved request status displayed', () => {
    const { getByText } = render(<BaseListItem {...props} />)
    const approvedStatus = getByText('Accepted')
    expect(approvedStatus).toBeTruthy()
})

it('test denied request status', () => {
    props.requestStatus = 'denied'
    const { getByText } = render(<BaseListItem {...props} />)
    const deniedStatus = getByText('Denied')
    expect(deniedStatus).toBeTruthy()
})

it('test pending request status', () => {
    props.requestStatus = 'pending'
    const { getByText } = render(<BaseListItem {...props} />)
    const pendingStatus = getByText('Pending')
    expect(pendingStatus).toBeTruthy()
})

it('test with error', () => {
    props.error = 'Here is an error'
    const { getByText } = render(<BaseListItem {...props} />)
    const errorText = getByText(props.error)
    expect(errorText).toBeTruthy()
})

it('test accept button does not exist', () => {
    props.onAccept = undefined
    const { queryByTestId } = render(<BaseListItem {...props} />)
    const acceptButton = queryByTestId('accept-button')
    expect(acceptButton).toBeDisabled()
    const deleteButton = queryByTestId('delete-button')
    expect(deleteButton).not.toBeDisabled()
})

it('test delete button does not exist', () => {
    props.onDelete = undefined
    const { queryByTestId } = render(<BaseListItem {...props} />)
    const deleteButton = queryByTestId('delete-button')
    expect(deleteButton).toBeDisabled()
    const acceptButton = queryByTestId('accept-button')
    expect(acceptButton).not.toBeDisabled()
})

it('test go button does not exist', () => {
    props.onPress = undefined
    const { queryByTestId } = render(<BaseListItem {...props} />)
    const goButton = queryByTestId('go-button')
    expect(goButton).toBeFalsy()
})
