import NetInfoIndicator from '../../../src/components/atoms/NetInfoIndicator'
import React from 'react'
import { render } from '@testing-library/react-native'

jest.mock('@react-native-community/netinfo', () => {
    return {
        useNetInfo: () => {
            return {
                isInternetReachable: true,
            }
        },
    }
})
jest.mock('react-native-paper', () => {
    const RNPaper = jest.requireActual('react-native-paper')
    return {
        ...RNPaper,
        Tooltip: () => {
            return <div>Network status indicator</div>
        },
    }
})

describe('NetInfoIndicator', () => {
    it('with reachable internet', async () => {
        const snapshot = render(<NetInfoIndicator />)
        expect(snapshot).toMatchSnapshot()
    })
})
