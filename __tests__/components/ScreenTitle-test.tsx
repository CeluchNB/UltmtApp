/**
 * @format
 */

import React from 'react'
import ReactNative from 'react-native'
import ScreenTitle from '../../src/components/ScreenTitle'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

it('renders correctly in dark mode', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockImplementationOnce(
        () => 'dark',
    )
    renderer.create(<ScreenTitle title="Login" />)
})

it('renders correctly in light mode', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockImplementationOnce(
        () => 'light',
    )
    renderer.create(<ScreenTitle title="Login" />)
})

it('matches snapshot', () => {
    const tree = renderer.create(<ScreenTitle title="Login" />).toJSON()
    expect(tree).toMatchSnapshot()
})
