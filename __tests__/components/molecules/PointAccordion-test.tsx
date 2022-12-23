import Point from '../../../src/types/point'
import PointAccordion from '../../../src/components/molecules/PointAccordion'
import React from 'react'
import { render } from '@testing-library/react-native'
import { ActionType, LiveServerAction } from '../../../src/types/action'
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
        playerOne: { firstName: 'First 1', lastName: 'Last 1' },
        playerTwo: { firstName: 'First 2', lastName: 'Last 2' },
    },
    {
        comments: [],
        tags: [],
        actionNumber: 2,
        actionType: ActionType.CATCH,
        teamNumber: 'one',
        playerTwo: { firstName: 'First 1', lastName: 'Last 1' },
        playerOne: { firstName: 'First 2', lastName: 'Last 2' },
    },
]

const onActionPress = jest.fn()

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
                onActionPress={onActionPress}
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
                onActionPress={onActionPress}
            />,
        )

        expect(snapshot).toMatchSnapshot()
    })
})
