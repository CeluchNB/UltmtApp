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
            console.log('sub called')
            subs = subscriptions
        },
    )
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

    // TODO: fix this test
    // it('should handle next point', async () => {
    //     const { getAllByText } = render(
    //         <NavigationContainer>
    //             <Provider store={store}>
    //                 <ViewGameScreen {...props} />
    //             </Provider>
    //         </NavigationContainer>,
    //     )

    //     await waitFor(() => {
    //         expect(getAllByText('Temper')).toBeTruthy()
    //     })

    //     fireEvent.press(getAllByText('Temper')[1])

    //     await waitFor(() => {
    //         expect(subs).toBeDefined()
    //     })

    //     await act(async () => {
    //         subs.point({})
    //     })

    //     expect(gameSpy).toHaveBeenCalled()
    //     expect(pointsSpy).toHaveBeenCalled()
    // })
})
