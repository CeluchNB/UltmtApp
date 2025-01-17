import * as React from 'react'
import UserInput from '../../../src/components/atoms/UserInput'
import { render } from '@testing-library/react-native'

beforeAll(() => {
    jest.useFakeTimers()
})

afterAll(() => {
    jest.useRealTimers()
})

it('test snapshot', () => {
    const snapshot = render(<UserInput placeholder="Placeholder" />).toJSON()
    expect(snapshot).toMatchSnapshot()
})

it('test with right icon', () => {
    const snapshot = render(
        <UserInput placeholder="Placeholder" rightIcon={true} />,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})
