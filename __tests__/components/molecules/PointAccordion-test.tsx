import Point from '../../../src/types/point'
import PointAccordion from '../../../src/components/molecules/PointAccordion'
import React from 'react'
import { ActionType, LiveServerAction } from '../../../src/types/action'
import { render, waitFor } from '@testing-library/react-native'
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    pullingTeam: { name: 'Temper' },
    receivingTeam: { name: 'Truck' },
    teamOnePlayers: [],
    teamTwoPlayers: [],
    teamOneScore: 2,
    teamTwoScore: 1,
    teamOneActive: true,
    teamTwoActive: false,
    teamOneActions: [],
    teamTwoActions: [],
}

const actions: LiveServerAction[] = [
    {
        comments: [],
        tags: ['huck'],
        actionNumber: 1,
        actionType: ActionType.CATCH,
        teamNumber: 'one',
    },
    {
        comments: [],
        tags: [],
        actionNumber: 2,
        actionType: ActionType.CATCH,
        teamNumber: 'one',
    },
]

describe('PointAccordion', () => {
    it('should match snapshot closed', () => {
        const snapshot = render(
            <PointAccordion
                point={point}
                actions={actions}
                loading={false}
                expanded={false}
                teamOne={{ name: 'Temper' }}
                teamTwo={{ name: 'Truck' }}
                isLive={false}
            />,
        )

        expect(snapshot.getByText('Temper')).toBeTruthy()
        expect(snapshot.getByText('Truck')).toBeTruthy()
        expect(snapshot.getByText('1')).toBeTruthy()
        expect(snapshot.getByText('2')).toBeTruthy()

        expect(snapshot).toMatchSnapshot()
    })

    it('should match snapshot open', async () => {
        const snapshot = render(
            <PointAccordion
                point={point}
                actions={actions}
                loading={false}
                expanded={true}
                teamOne={{ name: 'Temper' }}
                teamTwo={{ name: 'Truck' }}
                isLive={true}
            />,
        )

        await waitFor(() => {
            expect(snapshot.getByText('huck')).toBeTruthy()
        })

        expect(snapshot).toMatchSnapshot()
    })
})
