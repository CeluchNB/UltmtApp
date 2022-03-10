import '@testing-library/jest-native/extend-expect'
import * as React from 'react'
import renderer from 'react-test-renderer'
import UserListItem, {
    UserListItemProps,
} from '../../../src/components/atoms/UserListItem'
import { fireEvent, render } from '@testing-library/react-native'

let props: UserListItemProps

beforeEach(() => {
    props = {
        user: {
            _id: 'testid',
            firstName: 'first',
            lastName: 'last',
            username: 'firstlast',
        },
        showDelete: true,
        showAccept: true,
        onDelete: jest.fn(),
        onAccept: jest.fn(),
        onPress: jest.fn(),
        requestStatus: 'approved',
        error: undefined,
    }
})

it('matches snapshot with all props', () => {
    const snapshot = renderer.create(<UserListItem {...props} />)

    expect(snapshot).toMatchSnapshot()
})

it('test onpress called', () => {
    const { getByText, getByTestId } = render(<UserListItem {...props} />)
    const userDisplay = getByText('first last')
    fireEvent.press(userDisplay)

    const goButton = getByTestId('go-button')
    fireEvent.press(goButton)
    expect(props.onPress).toHaveBeenCalledTimes(2)
})

it('test approved request status displayed', () => {
    const { getByText } = render(<UserListItem {...props} />)
    const approvedStatus = getByText('Accepted')
    expect(approvedStatus).toBeTruthy()
})

it('test denied request status', () => {
    props.requestStatus = 'denied'
    const { getByText } = render(<UserListItem {...props} />)
    const deniedStatus = getByText('Denied')
    expect(deniedStatus).toBeTruthy()
})

it('test pending request status', () => {
    props.requestStatus = 'pending'
    const { getByText } = render(<UserListItem {...props} />)
    const pendingStatus = getByText('Pending')
    expect(pendingStatus).toBeTruthy()
})

it('test with error', () => {
    props.error = 'Here is an error'
    const { getByText } = render(<UserListItem {...props} />)
    const errorText = getByText(props.error)
    expect(errorText).toBeTruthy()
})

it('test accept button does not exist', () => {
    props.onAccept = undefined
    const { queryByTestId } = render(<UserListItem {...props} />)
    const acceptButton = queryByTestId('accept-button')
    expect(acceptButton).toBeDisabled()
    const deleteButton = queryByTestId('delete-button')
    expect(deleteButton).not.toBeDisabled()
})

it('test delete button does not exist', () => {
    props.onDelete = undefined
    const { queryByTestId } = render(<UserListItem {...props} />)
    const deleteButton = queryByTestId('delete-button')
    expect(deleteButton).toBeDisabled()
    const acceptButton = queryByTestId('accept-button')
    expect(acceptButton).not.toBeDisabled()
})

it('test go button does not exist', () => {
    props.onPress = undefined
    const { queryByTestId } = render(<UserListItem {...props} />)
    const goButton = queryByTestId('go-button')
    expect(goButton).toBeFalsy()
})
