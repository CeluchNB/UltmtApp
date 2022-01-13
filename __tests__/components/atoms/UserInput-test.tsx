import React from 'react'
import UserInput from '../../../src/components/atoms/UserInput'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

it('test snapshot', () => {
    const tree = renderer
        .create(<UserInput placeholder="Placeholder" />)
        .toJSON()
    expect(tree).toMatchSnapshot()
})
