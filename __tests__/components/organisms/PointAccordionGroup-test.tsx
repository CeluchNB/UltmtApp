import * as ActionData from '../../../src/services/data/action'
import * as PointData from '../../../src/services/data/point'
import { GuestTeam } from '../../../src/types/team'
import Point from '../../../src/types/point'
import React from 'react'
import {
    ActionType,
    LiveServerAction,
    SavedServerAction,
    SubscriptionObject,
} from '../../../src/types/action'
import PointAccordionGroup, {
    PointAccordionGroupProps,
} from '../../../src/components/organisms/PointAccordionGroup'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const points: Point[] = [
    {
        _id: 'point3',
        pointNumber: 1,
        pullingTeam: { name: 'Temper' },
        receivingTeam: { name: 'Truck' },
        teamOnePlayers: [],
        teamTwoPlayers: [],
        teamOneScore: 2,
        teamTwoScore: 0,
        teamOneActive: true,
        teamTwoActive: false,
        teamOneActions: [],
        teamTwoActions: [],
    },
    {
        _id: 'point2',
        pointNumber: 1,
        pullingTeam: { name: 'Temper' },
        receivingTeam: { name: 'Truck' },
        teamOnePlayers: [],
        teamTwoPlayers: [],
        teamOneScore: 2,
        teamTwoScore: 0,
        teamOneActive: false,
        teamTwoActive: false,
        teamOneActions: [],
        teamTwoActions: [],
    },
    {
        _id: 'point1',
        pointNumber: 1,
        pullingTeam: { name: 'Temper' },
        receivingTeam: { name: 'Truck' },
        teamOnePlayers: [],
        teamTwoPlayers: [],
        teamOneScore: 1,
        teamTwoScore: 0,
        teamOneActive: false,
        teamTwoActive: false,
        teamOneActions: [],
        teamTwoActions: [],
    },
]

const teamOne: GuestTeam = { name: 'Temper' }
const teamTwo: GuestTeam = { name: 'Truck' }

const savedActions: SavedServerAction[] = [
    {
        _id: 'action1',
        actionNumber: 1,
        actionType: ActionType.PICKUP,
        tags: ['pickup'],
        team: {
            _id: 'team1',
            place: 'Pgh',
            name: 'Temper',
            teamname: 'pghtemper',
            seasonStart: '2022',
            seasonEnd: '2022',
        },
        comments: [],
        playerOne: { firstName: 'First 1', lastName: 'Last 1' },
    },
    {
        _id: 'action2',
        actionNumber: 2,
        actionType: ActionType.CATCH,
        tags: [],
        team: {
            _id: 'team1',
            place: 'Pgh',
            name: 'Temper',
            teamname: 'pghtemper',
            seasonStart: '2022',
            seasonEnd: '2022',
        },
        comments: [],
        playerOne: { firstName: 'First 2', lastName: 'Last 2' },
        playerTwo: { firstName: 'First 1', lastName: 'Last 1' },
    },
    {
        _id: 'action3',
        actionNumber: 3,
        actionType: ActionType.TEAM_ONE_SCORE,
        tags: [],
        team: {
            _id: 'team1',
            place: 'Pgh',
            name: 'Temper',
            teamname: 'pghtemper',
            seasonStart: '2022',
            seasonEnd: '2022',
        },
        comments: [],
        playerOne: { firstName: 'First 1', lastName: 'Last 1' },
        playerTwo: { firstName: 'First 2', lastName: 'Last 2' },
    },
]
const liveActions: LiveServerAction[] = [
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

describe('PointAccordionGroup', () => {
    let props: PointAccordionGroupProps
    const deleteSpy = jest
        .spyOn(PointData, 'deleteAllActionsByPoint')
        .mockReturnValue(Promise.resolve())
    const savedSpy = jest
        .spyOn(PointData, 'getActionsByPoint')
        .mockImplementation((team, _) => {
            if (team === 'one') {
                return Promise.resolve(savedActions)
            }
            return Promise.resolve([])
        })
    const liveSpy = jest
        .spyOn(PointData, 'getLiveActionsByPoint')
        .mockReturnValue(Promise.resolve(liveActions))
    let subs: SubscriptionObject
    jest.spyOn(ActionData, 'subscribe').mockImplementation(
        async subscriptions => {
            subs = subscriptions
        },
    )

    beforeEach(() => {
        props = {
            gameId: 'game1',
            points,
            teamOne,
            teamTwo,
            onNextPoint: jest.fn(),
        }

        deleteSpy.mockClear()
        savedSpy.mockClear()
        liveSpy.mockClear()
    })

    it('should match snapshot', async () => {
        const snapshot = render(<PointAccordionGroup {...props} />)

        expect(snapshot).toMatchSnapshot()
    })

    it('should display live point', async () => {
        const { getAllByText, getByText } = render(
            <PointAccordionGroup {...props} />,
        )
        const point = getAllByText('Temper')[0]
        fireEvent.press(point)

        await waitFor(() => {
            expect(liveSpy).toHaveBeenCalled()
        })
        expect(getByText('huck')).toBeTruthy()
    })

    it('should display saved point', async () => {
        const { getAllByText, getByText } = render(
            <PointAccordionGroup {...props} />,
        )
        const point = getAllByText('Temper')[1]
        fireEvent.press(point)

        await waitFor(() => {
            expect(savedSpy).toHaveBeenCalled()
        })
        expect(getByText('pickup')).toBeTruthy()
    })

    it('should handle actions', async () => {
        const { getAllByText, getByText, queryByText } = render(
            <PointAccordionGroup {...props} />,
        )
        const point = getAllByText('Temper')[0]
        fireEvent.press(point)

        await waitFor(() => {
            expect(liveSpy).toHaveBeenCalled()
        })

        await act(async () => {
            subs.client({
                tags: ['newaction'],
                comments: [],
                actionType: ActionType.CATCH,
                actionNumber: 4,
                teamNumber: 'one',
            })
        })
        expect(getByText('newaction')).toBeTruthy()

        await act(async () => {
            subs.undo({})
        })
        expect(queryByText('newaction')).toBeFalsy()

        await act(async () => {
            subs.point({})
        })
        expect(queryByText('huck')).toBeFalsy()
        expect(props.onNextPoint).toHaveBeenCalled()
    })
})