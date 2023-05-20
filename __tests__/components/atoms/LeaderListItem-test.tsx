import LeaderListItem from '../../../src/components/atoms/LeaderListItem'
import React from 'react'
import { render, screen } from '@testing-library/react-native'

describe('LeaderListItem', () => {
    it('renders correctly', () => {
        render(
            <LeaderListItem
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
