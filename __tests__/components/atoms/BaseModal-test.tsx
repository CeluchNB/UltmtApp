import BaseModal from '../../../src/components/atoms/BaseModal'
import React from 'react'
import { View } from 'react-native'
import { render } from '@testing-library/react-native'

it('should match snapshot with minimal children', () => {
    const snapshot = render(
        <BaseModal visible={true} onClose={jest.fn()}>
            <View />
        </BaseModal>,
    )

    expect(snapshot).toMatchSnapshot()
})
