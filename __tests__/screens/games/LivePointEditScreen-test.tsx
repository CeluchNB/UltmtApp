import '@testing-library/jest-native/extend-expect'
import * as ActionData from '../../../src/services/data/live-action'
import * as GameServices from '../../../src/services/data/game'
import * as PointServices from '../../../src/services/data/point'
import * as usePointLocal from '../../../src/hooks/usePointLocal'
import EventEmitter from 'eventemitter3'
import { LivePointEditProps } from '../../../src/types/navigation'
import LivePointEditScreen from '../../../src/screens/games/LivePointEditScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { game } from '../../../fixtures/data'
import { setPoint } from '../../../src/store/reducers/features/point/livePointReducer'
import store from '../../../src/store/store'
import {
    ActionFactory,
    ActionType,
    LiveServerActionData,
} from '../../../src/types/action'
import Point, { LocalPointEvents } from '../../../src/types/point'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'
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
const navigate = jest.fn()
const props: LivePointEditProps = {
    navigation: {
        reset,
        navigate,
    } as any,
    route: {} as any,
}

const playerList1 = [
    { _id: 'p8', firstName: 'First 8', lastName: 'Last 8', username: 'fl8' },
    { _id: 'p9', firstName: 'First 9', lastName: 'Last 9', username: 'fl9' },
    {
        _id: 'p10',
        firstName: 'First 10',
        lastName: 'Last 10',
        username: 'fl10',
    },
    {
        _id: 'p11',
        firstName: 'First 11',
        lastName: 'Last 11',
        username: 'fl11',
    },
    {
        _id: 'p12',
        firstName: 'First 12',
        lastName: 'Last 12',
        username: 'fl12',
    },
    {
        _id: 'p13',
        firstName: 'First 13',
        lastName: 'Last 13',
        username: 'fl13',
    },
    {
        _id: 'p14',
        firstName: 'First 14',
        lastName: 'Last 14',
        username: 'fl14',
    },
]

const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    teamOnePlayers: playerList1,
    teamTwoPlayers: playerList1,
    teamOneActivePlayers: playerList1,
    teamTwoActivePlayers: playerList1,
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
    jest.resetAllMocks()

    jest.spyOn(ActionData, 'saveLocalAction').mockImplementation(data =>
        Promise.resolve({
            action: ActionFactory.createFromAction(data),
            point: point,
        }),
    )
    jest.spyOn(ActionData, 'deleteLocalAction').mockResolvedValue(
        Promise.resolve({
            action: {
                actionNumber: 1,
                actionType: ActionType.PULL,
                teamNumber: 'one',
                comments: [],
                tags: [],
            },
            point,
        }),
    )
})

const client = new QueryClient()

describe('LivePointEditScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    jest.spyOn(ActionData, 'getLocalActionsByPoint').mockResolvedValue([])

    it('matches snapshot', async () => {
        render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <LivePointEditScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        expect(screen.getByText('First 8 Last 8')).toBeTruthy()
        expect(screen.getByText('First 9 Last 9')).toBeTruthy()
        expect(screen.getByText('First 10 Last 10')).toBeTruthy()
        expect(screen.getByText('First 11 Last 11')).toBeTruthy()
        expect(screen.getAllByText('Pull').length).toBe(7)
    })

    it('handles basic D point', async () => {
        const finishPointSpy = jest
            .spyOn(PointServices, 'finishPoint')
            .mockReturnValueOnce(Promise.resolve({ ...point, teamTwoScore: 1 }))
        const createPointSpy = jest
            .spyOn(PointServices, 'createPoint')
            .mockReturnValueOnce(
                Promise.resolve({
                    ...point,
                    teamTwoScore: 1,
                    pullingTeam: game.teamTwo,
                    receivingTeam: game.teamOne,
                    pointNumber: 2,
                }),
            )

        const emitter = new EventEmitter()
        jest.spyOn(usePointLocal, 'default').mockReturnValue(emitter)

        const { getAllByText, getByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <LivePointEditScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        const pullBtn = getAllByText('Pull')[2]

        await waitFor(() => {
            expect(pullBtn).not.toBeDisabled()
        })

        fireEvent.press(pullBtn)
        await act(async () => {
            const pull: LiveServerActionData = {
                actionNumber: 1,
                actionType: ActionType.PULL,
                teamNumber: 'one',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, pull)
        })
        fireEvent.press(getByText('they score'))
        await act(async () => {
            const theyScore: LiveServerActionData = {
                actionNumber: 2,
                actionType: ActionType.TEAM_TWO_SCORE,
                teamNumber: 'one',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, theyScore)
        })
        fireEvent.press(getByText('next point'))

        await waitFor(() => {
            expect(reset).toHaveBeenCalledWith({
                index: 0,
                routes: [{ name: 'SelectPlayers' }],
            })
        })
        expect(finishPointSpy).toHaveBeenCalledWith(point._id)
        expect(store.getState().liveGame.game.teamTwoScore).toBe(1)
        expect(store.getState().liveGame.game.teamOneScore).toBe(0)
        expect(createPointSpy).toHaveBeenCalledWith(false, 2)
    })

    it('handles basic O point', async () => {
        store.dispatch(setTeam('two'))
        const finishPointSpy = jest
            .spyOn(PointServices, 'finishPoint')
            .mockReturnValueOnce(Promise.resolve({ ...point, teamOneScore: 1 }))
        const createPointSpy = jest
            .spyOn(PointServices, 'createPoint')
            .mockReturnValueOnce(
                Promise.resolve({
                    ...point,
                    teamOneScore: 1,
                    pullingTeam: game.teamTwo,
                    receivingTeam: game.teamOne,
                    pointNumber: 2,
                }),
            )

        const emitter = new EventEmitter()
        jest.spyOn(usePointLocal, 'default').mockReturnValue(emitter)

        const { getAllByText, getByText, getByTestId } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <LivePointEditScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        const catchBtn = getAllByText('Catch')[1]
        await waitFor(() => {
            expect(catchBtn).not.toBeDisabled()
        })

        fireEvent.press(catchBtn)
        await act(async () => {
            const catchAction: LiveServerActionData = {
                actionNumber: 1,
                actionType: ActionType.CATCH,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, catchAction)
        })
        fireEvent.press(getAllByText('Catch')[2])
        await act(async () => {
            const catchAction: LiveServerActionData = {
                actionNumber: 2,
                actionType: ActionType.CATCH,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, catchAction)
        })
        fireEvent.press(getAllByText('Catch')[3])
        await act(async () => {
            const catchAction: LiveServerActionData = {
                actionNumber: 3,
                actionType: ActionType.CATCH,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, catchAction)
        })
        fireEvent.press(getAllByText('Catch')[4])
        await act(async () => {
            const catchAction: LiveServerActionData = {
                actionNumber: 4,
                actionType: ActionType.CATCH,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, catchAction)
        })
        fireEvent.press(getByTestId('undo-button'))
        await act(async () => {
            emitter.emit(LocalPointEvents.UNDO_LISTEN, {
                team: 'one',
                actionNumber: 4,
            })
        })
        fireEvent.press(getAllByText('score')[4])
        await act(async () => {
            const scoreAction: LiveServerActionData = {
                actionNumber: 5,
                actionType: ActionType.TEAM_ONE_SCORE,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, scoreAction)
        })
        fireEvent.press(getByText('next point'))

        await waitFor(() => {
            expect(reset).toHaveBeenCalledWith({
                index: 0,
                routes: [{ name: 'SelectPlayers' }],
            })
        })
        expect(finishPointSpy).toHaveBeenCalledWith(point._id)
        expect(store.getState().liveGame.game.teamTwoScore).toBe(0)
        expect(store.getState().liveGame.game.teamOneScore).toBe(1)
        expect(createPointSpy).toHaveBeenCalledWith(false, 2)
    })

    it('handles finish game', async () => {
        const finishPointSpy = jest
            .spyOn(PointServices, 'finishPoint')
            .mockReturnValueOnce(Promise.resolve({ ...point, teamTwoScore: 1 }))
        const finishGameSpy = jest
            .spyOn(GameServices, 'finishGame')
            .mockReturnValueOnce(Promise.resolve(game))

        const emitter = new EventEmitter()
        jest.spyOn(usePointLocal, 'default').mockReturnValue(emitter)

        const { getAllByText, getByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <LivePointEditScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        const pullBtn = getAllByText('Pull')[2]

        await waitFor(() => {
            expect(pullBtn).not.toBeDisabled()
        })

        fireEvent.press(pullBtn)
        await act(async () => {
            const pull: LiveServerActionData = {
                actionNumber: 1,
                actionType: ActionType.PULL,
                teamNumber: 'one',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, pull)
        })
        fireEvent.press(getByText('they score'))
        await act(async () => {
            const theyScore: LiveServerActionData = {
                actionNumber: 2,
                actionType: ActionType.TEAM_TWO_SCORE,
                teamNumber: 'one',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, theyScore)
        })
        fireEvent.press(getByText('finish game'))

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith('Tabs', {
                screen: 'Account',
                params: { screen: 'Profile', initial: false },
            })
        })
        expect(finishPointSpy).toHaveBeenCalledWith(point._id)
        expect(finishGameSpy).toHaveBeenCalled()
    })

    it('handles offline game actions', async () => {
        store.dispatch(
            setGame({
                ...game,
                teamOnePlayers: playerList1,
                teamTwoPlayers: [],
                tournament: undefined,
                startTime: '2022',
                offline: true,
            }),
        )
        store.dispatch(setTeam('two'))
        const finishPointSpy = jest
            .spyOn(PointServices, 'finishPoint')
            .mockReturnValueOnce(Promise.resolve({ ...point, teamOneScore: 1 }))
        const createPointSpy = jest
            .spyOn(PointServices, 'createPoint')
            .mockReturnValueOnce(
                Promise.resolve({
                    ...point,
                    teamOneScore: 1,
                    pullingTeam: game.teamTwo,
                    receivingTeam: game.teamOne,
                    pointNumber: 2,
                }),
            )
        jest.spyOn(GameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(ActionData, 'createOfflineAction').mockImplementation(
            async action => {
                return {
                    action: ActionFactory.createFromAction({
                        ...action,
                        teamNumber: 'two',
                        actionNumber: 1,
                        comments: [],
                    } as LiveServerActionData),
                    point,
                }
            },
        )
        jest.spyOn(ActionData, 'undoOfflineAction').mockImplementation(
            async _pointId => {
                return {
                    action: {
                        teamNumber: 'two',
                        comments: [],
                        tags: [],
                        actionNumber: 1,
                        actionType: ActionType.PULL,
                    },
                    point,
                }
            },
        )

        const emitter = new EventEmitter()
        jest.spyOn(usePointLocal, 'default').mockReturnValue(emitter)

        const { getAllByText, getByText, getByTestId } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <LivePointEditScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        const catchBtn = getAllByText('Catch')[1]
        await waitFor(() => {
            expect(catchBtn).not.toBeDisabled()
        })

        fireEvent.press(catchBtn)
        await act(async () => {
            const catchAction: LiveServerActionData = {
                actionNumber: 1,
                actionType: ActionType.CATCH,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, catchAction)
        })
        fireEvent.press(getAllByText('Catch')[2])
        await act(async () => {
            const catchAction: LiveServerActionData = {
                actionNumber: 2,
                actionType: ActionType.CATCH,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, catchAction)
        })
        fireEvent.press(getAllByText('Catch')[3])
        await act(async () => {
            const catchAction: LiveServerActionData = {
                actionNumber: 3,
                actionType: ActionType.CATCH,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, catchAction)
        })
        fireEvent.press(getAllByText('Catch')[4])
        await act(async () => {
            const catchAction: LiveServerActionData = {
                actionNumber: 4,
                actionType: ActionType.CATCH,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, catchAction)
        })
        fireEvent.press(getByTestId('undo-button'))
        await act(async () => {
            emitter.emit(LocalPointEvents.UNDO_LISTEN, {
                team: 'two',
                actionNumber: 4,
            })
        })
        fireEvent.press(getAllByText('score')[4])
        await act(async () => {
            const scoreAction: LiveServerActionData = {
                actionNumber: 5,
                actionType: ActionType.TEAM_ONE_SCORE,
                teamNumber: 'two',
                comments: [],
                tags: [],
            }
            emitter.emit(LocalPointEvents.ACTION_LISTEN, scoreAction)
        })
        fireEvent.press(getByText('next point'))

        await waitFor(() => {
            expect(reset).toHaveBeenCalledWith({
                index: 0,
                routes: [{ name: 'SelectPlayers' }],
            })
        })
        expect(finishPointSpy).toHaveBeenCalledWith(point._id)
        expect(store.getState().liveGame.game.teamTwoScore).toBe(0)
        expect(store.getState().liveGame.game.teamOneScore).toBe(1)
        expect(createPointSpy).toHaveBeenCalledWith(false, 2)
    })
})
