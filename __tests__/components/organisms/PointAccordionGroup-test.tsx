import { GuestTeam } from '../../../src/types/team'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../../src/store/store'
import {
    Action,
    ActionFactory,
    ActionType,
    LiveServerActionData,
} from '../../../src/types/action'
import Point, { PointStatus } from '../../../src/types/point'
import PointAccordionGroup, {
    PointAccordionGroupProps,
} from '../../../src/components/organisms/PointAccordionGroup'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

const mockedNavigate = jest.fn()

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            addListener: jest.fn().mockReturnValue(() => {}),
            navigate: mockedNavigate,
        }),
    }
})
jest.mock('react-native-google-mobile-ads', () => {
    return {
        default: { initialize: jest.fn(), setRequestConfiguration: jest.fn() },
        MaxAdsContentRating: { T: 'T', PG: 'PG' },
        BannerAd: 'Ad',
        BannerAdSize: { BANNER: 'banner' },
        TestIds: { BANNER: 'bannertest' },
    }
})

const points: Point[] = [
    {
        _id: 'point3',
        pointNumber: 1,
        pullingTeam: { name: 'Temper' },
        receivingTeam: { name: 'Truck' },
        teamOnePlayers: [],
        teamTwoPlayers: [],
        teamOneActivePlayers: [],
        teamTwoActivePlayers: [],
        teamOneScore: 2,
        teamTwoScore: 0,
        teamOneActions: [],
        teamTwoActions: [],
        gameId: 'game1',
        teamOneStatus: PointStatus.ACTIVE,
        teamTwoStatus: PointStatus.FUTURE,
    },
    {
        _id: 'point2',
        pointNumber: 1,
        pullingTeam: { name: 'Temper' },
        receivingTeam: { name: 'Truck' },
        teamOnePlayers: [],
        teamTwoPlayers: [],
        teamOneActivePlayers: [],
        teamTwoActivePlayers: [],
        teamOneScore: 2,
        teamTwoScore: 0,
        teamOneActions: [],
        teamTwoActions: [],
        gameId: 'game1',
        teamOneStatus: PointStatus.FUTURE,
        teamTwoStatus: PointStatus.FUTURE,
    },
    {
        _id: 'point1',
        pointNumber: 1,
        pullingTeam: { name: 'Temper' },
        receivingTeam: { name: 'Truck' },
        teamOnePlayers: [],
        teamTwoPlayers: [],
        teamOneActivePlayers: [],
        teamTwoActivePlayers: [],
        teamOneScore: 1,
        teamTwoScore: 0,
        teamOneActions: [],
        teamTwoActions: [],
        gameId: 'game1',
        teamOneStatus: PointStatus.FUTURE,
        teamTwoStatus: PointStatus.FUTURE,
    },
]

const teamOne: GuestTeam = { name: 'Temper' }
const teamTwo: GuestTeam = { name: 'Truck' }

const savedActions: Action[] = [
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
        playerOne: {
            _id: 'user1',
            firstName: 'First 1',
            lastName: 'Last 1',
            username: 'firstlast1',
        },
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
        playerOne: {
            _id: 'user2',
            firstName: 'First 2',
            lastName: 'Last 2',
            username: 'firstlast2',
        },
        playerTwo: {
            _id: 'user1',
            firstName: 'First 1',
            lastName: 'Last 1',
            username: 'firstlast1',
        },
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
].map(a => ActionFactory.createFromAction(a))

const liveActions: Action[] = [
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

describe('PointAccordionGroup', () => {
    let props: PointAccordionGroupProps

    beforeEach(() => {
        props = {
            displayedActions: liveActions,
            loading: false,
            points,
            teamOne,
            teamTwo,
            error: '',
            onSelectPoint: jest.fn(),
            onSelectAction: jest.fn(),
            onRefresh: jest.fn(),
        }
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            <NavigationContainer>
                <Provider store={store}>
                    <PointAccordionGroup {...props} />
                </Provider>
            </NavigationContainer>,
        )

        expect(snapshot).toMatchSnapshot()
    })

    it('should display live point', async () => {
        const { getAllByText, queryByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <PointAccordionGroup {...props} />
                </Provider>
            </NavigationContainer>,
        )

        expect(queryByText('huck')).toBeFalsy()

        const point = getAllByText('Temper (pull)')[0]
        fireEvent.press(point)

        await waitFor(() => {
            expect(props.onSelectPoint).toHaveBeenCalled()
        })
        expect(queryByText('huck')).toBeTruthy()
    })

    it('should display saved point', async () => {
        props.displayedActions = savedActions
        const { getAllByText, queryByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <PointAccordionGroup {...props} />
                </Provider>
            </NavigationContainer>,
        )
        expect(queryByText('pickup')).toBeFalsy()

        const point = getAllByText('Temper (pull)')[1]
        fireEvent.press(point)

        await waitFor(() => {
            expect(props.onSelectPoint).toHaveBeenCalled()
        })
        expect(queryByText('pickup')).toBeTruthy()
    })

    it('should handle actions', async () => {
        const { getAllByText, getByText, queryByText, rerender } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <PointAccordionGroup {...props} />
                </Provider>
            </NavigationContainer>,
        )
        const point = getAllByText('Temper (pull)')[0]
        fireEvent.press(point)

        await waitFor(() => {
            expect(props.onSelectPoint).toHaveBeenCalled()
        })

        props.displayedActions.push(
            ActionFactory.createFromAction({
                tags: ['newaction'],
                comments: [],
                actionType: ActionType.CATCH,
                actionNumber: 4,
                teamNumber: 'one',
            } as LiveServerActionData),
        )

        rerender(
            <NavigationContainer>
                <Provider store={store}>
                    <PointAccordionGroup {...props} />
                </Provider>
            </NavigationContainer>,
        )
        expect(getByText('newaction')).toBeTruthy()

        props.displayedActions.pop()
        rerender(
            <NavigationContainer>
                <Provider store={store}>
                    <PointAccordionGroup {...props} />
                </Provider>
            </NavigationContainer>,
        )
        expect(queryByText('newaction')).toBeFalsy()
    })

    it('should handle action press', async () => {
        const { getAllByText, getByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <PointAccordionGroup {...props} />
                </Provider>
            </NavigationContainer>,
        )
        const point = getAllByText('Temper (pull)')[0]
        fireEvent.press(point)

        await waitFor(() => {
            expect(props.onSelectPoint).toHaveBeenCalled()
        })
        expect(getByText('huck')).toBeTruthy()
        fireEvent.press(getByText('huck'))

        expect(props.onSelectAction).toHaveBeenCalled()
    })
})
