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
