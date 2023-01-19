import * as ActionData from '../../../src/services/data/live-action'
import * as GameData from '../../../src/services/data/game'
import * as PointData from '../../../src/services/data/point'
import { NavigationContainer } from '@react-navigation/native'
import Point from '../../../src/types/point'
import { Provider } from 'react-redux'
import React from 'react'
import { ViewGameProps } from '../../../src/types/navigation'
import ViewGameScreen from '../../../src/screens/games/ViewGameScreen'
import { game } from '../../../fixtures/data'
import store from '../../../src/store/store'
import {
    ActionType,
    LiveServerAction,
    SavedServerAction,
    SubscriptionObject,
} from '../../../src/types/action'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const props: ViewGameProps = {
    navigation: {
        addListener: jest.fn().mockReturnValue(() => {}),
        navigate: jest.fn(),
    } as any,
    route: { params: { gameId: 'game1' } } as any,
}

const points: Point[] = [
    {
        _id: 'point3',
        pointNumber: 1,
        pullingTeam: { name: 'Temper' },
        receivingTeam: { name: 'Sockeye' },
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
        receivingTeam: { name: 'Sockeye' },
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
        receivingTeam: { name: 'Sockeye' },
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
]
const liveActions: LiveServerAction[] = [
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
]

describe('ViewGameScreen', () => {
    const gameSpy = jest
        .spyOn(GameData, 'getGameById')
        .mockReturnValue(Promise.resolve(game))
    const pointsSpy = jest
        .spyOn(GameData, 'getPointsByGame')
        .mockReturnValue(Promise.resolve(points))
    let subs: SubscriptionObject
    jest.spyOn(ActionData, 'subscribe').mockImplementation(
        async subscriptions => {
            subs = subscriptions
        },
    )
    jest.spyOn(ActionData, 'joinPoint').mockReturnValue(Promise.resolve())
    beforeEach(() => {
        jest.spyOn(PointData, 'deleteLocalActionsByPoint').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(PointData, 'getActionsByPoint').mockReturnValue(
            Promise.resolve(savedActions),
        )
        jest.spyOn(PointData, 'getLiveActionsByPoint').mockReturnValue(
            Promise.resolve(liveActions),
        )
        jest.clearAllMocks()
    })

    it('should match snapshot after data loaded', async () => {
        const snapshot = render(
            <NavigationContainer>
                <Provider store={store}>
                    <ViewGameScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(snapshot.queryAllByText('Temper').length).toBe(4)
        })

        expect(snapshot.getAllByText('Sockeye').length).toBe(4)

        expect(gameSpy).toHaveBeenCalled()
        expect(pointsSpy).toHaveBeenCalled()
    })

    it('should handle next point', async () => {
        const { getAllByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <ViewGameScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(getAllByText('Temper')).toBeTruthy()
        })

        fireEvent.press(getAllByText('Temper')[1])

        await waitFor(() => {
            expect(subs).toBeDefined()
        })

        await act(async () => {
            subs.point({})
        })

        expect(gameSpy).toHaveBeenCalled()
        expect(pointsSpy).toHaveBeenCalled()
    })

    it('handles live point functionality', async () => {
        const { getAllByText, queryByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <ViewGameScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(async () => {
            expect(getAllByText('Temper').length).toBe(4)
        })

        const livePoint = getAllByText('Temper')[1]
        fireEvent.press(livePoint)

        await waitFor(async () => {
            expect(queryByText('huck')).toBeTruthy()
        })

        act(() => {
            subs.client({
                actionNumber: 4,
                actionType: ActionType.CATCH,
                tags: ['newaction'],
                comments: [],
                playerOne: {
                    _id: 'player1',
                    firstName: 'First1',
                    lastName: 'Last1',
                    username: 'firstlast1',
                },
                teamNumber: 'one',
            } as LiveServerAction)
        })

        await waitFor(async () => {
            expect(queryByText('newaction')).toBeTruthy()
        })

        act(() => {
            subs.undo({ actionNumber: 4, team: 'one' })
        })

        await waitFor(async () => {
            expect(queryByText('newaction')).toBeFalsy()
        })

        act(() => {
            subs.point({})
        })

        await waitFor(async () => {
            expect(gameSpy).toHaveBeenCalledTimes(2)
        })
        expect(pointsSpy).toHaveBeenCalledTimes(2)
    })

    it('handles saved point functionality', async () => {
        const { getAllByText, queryAllByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <ViewGameScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(async () => {
            expect(getAllByText('Temper').length).toBe(4)
        })

        const savedPoint = getAllByText('Temper')[2]
        fireEvent.press(savedPoint)

        await waitFor(async () => {
            expect(queryAllByText('pickup').length).toBe(2)
        })
    })

    it('handles live action select', async () => {
        const { getAllByText, getByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <ViewGameScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(async () => {
            expect(getAllByText('Temper').length).toBe(4)
        })

        const livePoint = getAllByText('Temper')[1]
        fireEvent.press(livePoint)

        await waitFor(async () => {
            expect(getByText('huck')).toBeTruthy()
        })

        fireEvent.press(getByText('huck'))

        expect(props.navigation.navigate).toHaveBeenCalledWith('Comment', {
            gameId: 'game1',
            pointId: 'point3',
            live: true,
        })

        expect(store.getState().viewAction.liveAction).toMatchObject(
            liveActions[0],
        )
        expect(store.getState().viewAction.teamOne).toMatchObject(game.teamOne)
        expect(store.getState().viewAction.teamTwo).toMatchObject(game.teamTwo)
    })

    it('handles saved action select', async () => {
        const { getAllByText, queryAllByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <ViewGameScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(async () => {
            expect(getAllByText('Temper').length).toBe(4)
        })

        const livePoint = getAllByText('Temper')[2]
        fireEvent.press(livePoint)

        await waitFor(async () => {
            expect(queryAllByText('pickup')).toBeTruthy()
        })

        fireEvent.press(queryAllByText('pickup')[0])

        expect(props.navigation.navigate).toHaveBeenCalledWith('Comment', {
            gameId: 'game1',
            pointId: 'point2',
            live: false,
        })

        expect(store.getState().viewAction.savedAction).toMatchObject(
            savedActions[0],
        )
        expect(store.getState().viewAction.teamOne).toMatchObject(game.teamOne)
        expect(store.getState().viewAction.teamTwo).toMatchObject(game.teamTwo)
    })
})
