import BaseScreen from '../../../src/components/atoms/BaseScreen'
import React from 'react'
import { View } from 'react-native'
import { render } from '@testing-library/react-native'

it('should match snapshot', () => {
    const snaphot = render(
        <BaseScreen containerWidth="80%">
            <View />
        </BaseScreen>,
    )

    expect(snaphot.toJSON()).toMatchSnapshot()
})
