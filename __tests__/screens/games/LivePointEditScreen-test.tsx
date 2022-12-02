import * as ActionData from '../../../src/services/data/action'
import * as PointServices from '../../../src/services/network/point'
import { LiveGameProps } from '../../../src/types/navigation'
import LivePointEditScreen from '../../../src/screens/games/LivePointEditScreen'
import { NavigationContainer } from '@react-navigation/native'
import Point from '../../../src/types/point'
import { Provider } from 'react-redux'
import React from 'react'
import { game } from '../../../fixtures/data'
import { setPoint } from '../../../src/store/reducers/features/point/livePointReducer'
import store from '../../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import {
    setGame,
    setTeam,
} from '../../../src/store/reducers/features/game/liveGameReducer'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const originalWarn = console.warn.bind(console.warn)
beforeAll(() => {
    console.warn = msg =>
        !msg.toString().includes('flexWrap: `wrap`') && originalWarn(msg)
})
afterAll(() => {
    console.warn = originalWarn
})

const reset = jest.fn()
const props: LiveGameProps = {
    navigation: {
        reset,
        navigate: jest.fn(),
    } as any,
    route: {} as any,
}

const playerList1 = [
    { firstName: 'First 8', lastName: 'Last 8' },
    { firstName: 'First 9', lastName: 'Last 9' },
    { firstName: 'First 10', lastName: 'Last 10' },
    { firstName: 'First 11', lastName: 'Last 11' },
    { firstName: 'First 12', lastName: 'Last 12' },
    { firstName: 'First 13', lastName: 'Last 13' },
    { firstName: 'First 14', lastName: 'Last 14' },
]

const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    teamOnePlayers: playerList1,
    teamTwoPlayers: playerList1,
    teamOneScore: 0,
    teamTwoScore: 0,
    pullingTeam: game.teamOne,
    receivingTeam: game.teamTwo,
    teamOneActive: true,
    teamTwoActive: false,
    teamOneActions: [],
    teamTwoActions: [],
}

beforeEach(() => {
    store.dispatch(
        setGame({
            ...game,
            teamOnePlayers: playerList1,
            teamTwoPlayers: [],
            tournament: undefined,
            startTime: '2022',
        }),
    )
    store.dispatch(setPoint(point))
    store.dispatch(setTeam('one'))
    reset.mockClear()
    jest.spyOn(ActionData, 'joinPoint').mockReturnValue(Promise.resolve())
    jest.spyOn(ActionData, 'addAction').mockReturnValue(Promise.resolve())
    jest.spyOn(ActionData, 'undoAction').mockReturnValue(Promise.resolve())
    jest.spyOn(ActionData, 'subscribe').mockReturnValue(Promise.resolve())
})

it('should match snapshot', () => {
    const snapshot = render(
        <NavigationContainer>
            <Provider store={store}>
                <LivePointEditScreen {...props} />
            </Provider>
        </NavigationContainer>,
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should handle basic D point', async () => {
    const finishPointSpy = jest
        .spyOn(PointServices, 'finishPoint')
        .mockReturnValueOnce(
            Promise.resolve({
                data: { point: { ...point, teamTwoScore: 1 } },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
    const createPointSpy = jest
        .spyOn(PointServices, 'createPoint')
        .mockReturnValueOnce(
            Promise.resolve({
                data: {
                    point: {
                        ...point,
                        teamTwoScore: 1,
                        pullingTeam: game.teamTwo,
                        receivingTeam: game.teamOne,
                        pointNumber: 2,
                    },
                },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
    const { getAllByText, getByText } = render(
        <NavigationContainer>
            <Provider store={store}>
                <LivePointEditScreen {...props} />
            </Provider>
        </NavigationContainer>,
    )

    fireEvent.press(getAllByText('Pull')[2])
    fireEvent.press(getByText('they score'))
    fireEvent.press(getByText('finish point'))

    await waitFor(() => {
        expect(reset).toHaveBeenCalledWith({
            index: 0,
            routes: [{ name: 'SelectPlayers' }],
        })
    })
    expect(finishPointSpy).toHaveBeenCalledWith('', point._id)
    expect(store.getState().liveGame.game.teamTwoScore).toBe(1)
    expect(store.getState().liveGame.game.teamOneScore).toBe(0)
    expect(createPointSpy).toHaveBeenCalledWith('', false, 2)
})

it('should handle basic O point', async () => {
    store.dispatch(setTeam('two'))
    const finishPointSpy = jest
        .spyOn(PointServices, 'finishPoint')
        .mockReturnValueOnce(
            Promise.resolve({
                data: { point: { ...point, teamOneScore: 1 } },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
    const createPointSpy = jest
        .spyOn(PointServices, 'createPoint')
        .mockReturnValueOnce(
            Promise.resolve({
                data: {
                    point: {
                        ...point,
                        teamOneScore: 1,
                        pullingTeam: game.teamTwo,
                        receivingTeam: game.teamOne,
                        pointNumber: 2,
                    },
                },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
    const { getAllByText, getByText, getByTestId } = render(
        <NavigationContainer>
            <Provider store={store}>
                <LivePointEditScreen {...props} />
            </Provider>
        </NavigationContainer>,
    )

    fireEvent.press(getAllByText('Catch')[1])
    fireEvent.press(getAllByText('Catch')[2])
    fireEvent.press(getAllByText('Catch')[3])
    fireEvent.press(getAllByText('Catch')[4])
    fireEvent.press(getByTestId('undo-button'))
    fireEvent.press(getAllByText('score')[4])
    fireEvent.press(getByText('finish point'))

    await waitFor(() => {
        expect(reset).toHaveBeenCalledWith({
            index: 0,
            routes: [{ name: 'SelectPlayers' }],
        })
    })
    expect(finishPointSpy).toHaveBeenCalledWith('', point._id)
    expect(store.getState().liveGame.game.teamTwoScore).toBe(0)
    expect(store.getState().liveGame.game.teamOneScore).toBe(1)
    expect(createPointSpy).toHaveBeenCalledWith('', false, 2)
})
