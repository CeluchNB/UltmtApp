import React from 'react'
import SmallLeaderListItem from '../../../src/components/atoms/SmallLeaderListItem'
import { render, screen } from '@testing-library/react-native'

describe('LeaderListItem', () => {
    it('renders correctly', () => {
        render(
            <SmallLeaderListItem
                leader={{
                    title: 'Goals',
                    player: {
                        _id: 'user1',
                        firstName: 'Noah',
                        lastName: 'Celuch',
                        username: 'noah',
                    },
                    total: 10,
                }}
            />,
        )

        expect(screen.getByText('Goals')).toBeTruthy()
        expect(screen.getByText('Noah Celuch')).toBeTruthy()
        expect(screen.getByText('10')).toBeTruthy()
    })
})
