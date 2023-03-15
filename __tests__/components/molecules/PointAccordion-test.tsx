import { List } from 'react-native-paper'
import Point from '../../../src/types/point'
import PointAccordion from '../../../src/components/molecules/PointAccordion'
import React from 'react'
import { render } from '@testing-library/react-native'
import { Action, ActionFactory, ActionType } from '../../../src/types/action'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('react-native-google-mobile-ads', () => {
    return {
        default: { initialize: jest.fn(), setRequestConfiguration: jest.fn() },
        MaxAdsContentRating: { T: 'T', PG: 'PG' },
        BannerAd: 'Ad',
        BannerAdSize: { BANNER: 'banner' },
        TestIds: { BANNER: 'bannertest' },
    }
})

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

const actions: Action[] = [
    {
        comments: [],
        tags: ['huck'],
        actionNumber: 1,
        actionType: ActionType.CATCH,
        teamNumber: 'one',
        playerOne: {
            _id: 'user1',
            firstName: 'First 1',
            lastName: 'Last 1',
            username: 'firstlast1',
        },
        playerTwo: {
            _id: 'user2',
            firstName: 'First 2',
            lastName: 'Last 2',
            username: 'firstlast2',
        },
    },
    {
        comments: [],
        tags: [],
        actionNumber: 2,
        actionType: ActionType.CATCH,
        teamNumber: 'one',
        playerTwo: {
            _id: 'user1',
            firstName: 'First 1',
            lastName: 'Last 1',
            username: 'firstlast1',
        },
        playerOne: {
            _id: 'user2',
            firstName: 'First 2',
            lastName: 'Last 2',
            username: 'firstlast2',
        },
    },
].map(a => ActionFactory.createFromAction(a))

const onActionPress = jest.fn()

describe('PointAccordion', () => {
    it('should match snapshot closed', () => {
        const snapshot = render(
            <List.AccordionGroup expandedId="other1">
                <PointAccordion
                    point={point}
                    actions={actions}
                    loading={false}
                    expanded={false}
                    teamOne={{ name: 'Temper' }}
                    teamTwo={{ name: 'Truck' }}
                    error={''}
                    onActionPress={onActionPress}
                />
            </List.AccordionGroup>,
        )

        expect(snapshot.getByText('Temper')).toBeTruthy()
        expect(snapshot.getByText('Truck')).toBeTruthy()
        expect(snapshot.getByText('1')).toBeTruthy()
        expect(snapshot.getByText('2')).toBeTruthy()

        expect(snapshot).toMatchSnapshot()
    })

    it('should match snapshot open', async () => {
        const snapshot = render(
            <List.AccordionGroup expandedId={point._id}>
                <PointAccordion
                    point={point}
                    actions={actions}
                    loading={false}
                    expanded={true}
                    teamOne={{ name: 'Temper' }}
                    teamTwo={{ name: 'Truck' }}
                    error={''}
                    onActionPress={onActionPress}
                />
            </List.AccordionGroup>,
        )

        expect(snapshot).toMatchSnapshot()
    })

    it('displays error', () => {
        const { getByText } = render(
            <List.AccordionGroup expandedId={point._id}>
                <PointAccordion
                    point={point}
                    actions={actions}
                    loading={false}
                    expanded={false}
                    teamOne={{ name: 'Temper' }}
                    teamTwo={{ name: 'Truck' }}
                    error={'test error'}
                    onActionPress={onActionPress}
                />
            </List.AccordionGroup>,
        )

        expect(getByText('test error')).toBeTruthy()
    })
})
