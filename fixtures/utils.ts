import { ReactTestInstance } from 'react-test-renderer'
import { expect } from '@jest/globals'
import { waitFor } from '@testing-library/react-native'

export const waitUntilRefreshComplete = async (node: ReactTestInstance) => {
    await waitFor(() => {
        expect(node.props.refreshControl.props.refreshing).toBe(false)
    })
}
