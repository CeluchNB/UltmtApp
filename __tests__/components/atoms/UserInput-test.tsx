import * as React from 'react'
import UserInput from '../../../src/components/atoms/UserInput'
import renderer from 'react-test-renderer'

it('test snapshot', () => {
    const snapshot = renderer
        .create(<UserInput placeholder="Placeholder" />)
        .toJSON()
    expect(snapshot).toMatchSnapshot()
})

it('test with right icon', () => {
    const snapshot = renderer
        .create(<UserInput placeholder="Placeholder" rightIcon={true} />)
        .toJSON()

    expect(snapshot).toMatchSnapshot()
})
