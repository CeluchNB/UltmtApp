import React from 'react'
import ScreenTitle from '../../../src/components/atoms/ScreenTitle'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

it('matches snapshot', () => {
    const tree = renderer.create(<ScreenTitle title="Login" />).toJSON()
    expect(tree).toMatchSnapshot()
})

it('renders correctly in dark mode', () => {
    renderer.create(<ScreenTitle title="Login" />)
})
