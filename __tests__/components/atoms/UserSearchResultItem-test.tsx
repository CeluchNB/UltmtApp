import '@testing-library/jest-native/extend-expect'
import * as React from 'react'
import renderer from 'react-test-renderer'
import UserSearchResultItem, {
    UserSearchResultItemProps,
} from './../../../src/components/atoms/UserSearchResultItem'
import { fireEvent, render } from '@testing-library/react-native'

let props: UserSearchResultItemProps

beforeEach(() => {
    props = {
        name: 'first last',
        username: 'firstlast',
        loading: false,
        onPress: jest.fn(),
        error: undefined,
    }
})

it('test matches snapshot', () => {
    const snapshot = renderer.create(<UserSearchResultItem {...props} />)
    expect(snapshot).toMatchSnapshot()
})

it('test on press called', () => {
    const { getByText } = render(<UserSearchResultItem {...props} />)

    const item = getByText(props.name)
    fireEvent.press(item)

    expect(props.onPress).toHaveBeenCalledTimes(1)
})

it('test error displays', () => {
    props.error = 'test error'
    const { getByText } = render(<UserSearchResultItem {...props} />)

    const item = getByText(props.error)
    expect(item).toBeTruthy()
})

it('test matches snapshot while loading displays', () => {
    props.loading = true
    const container = renderer.create(<UserSearchResultItem {...props} />)

    expect(container).toMatchSnapshot()
})
