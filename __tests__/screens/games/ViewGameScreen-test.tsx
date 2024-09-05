import * as GameData from '../../../src/services/data/game'
import * as GameNetwork from '../../../src/services/network/game'
import * as PointData from '../../../src/services/data/point'
import * as StatsData from '../../../src/services/data/stats'
import * as StatsNetwork from '../../../src/services/network/stats'
import { AxiosResponse } from 'axios'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { ViewGameProps } from '../../../src/types/navigation'
import ViewGameScreen from '../../../src/screens/games/ViewGameScreen'
import { fetchProfileData } from '../../../fixtures/data'
import { setProfile } from '../../../src/store/reducers/features/account/accountReducer'
import store from '../../../src/store/store'
import { withRealm } from '../../utils/renderers'
import {
    Action,
    ActionFactory,
    ActionType,
    LiveServerActionData,
} from '../../../src/types/action'
import { GameFactory, GameStatsFactory } from '../../test-data/game'
import Point, { PointStatus } from '../../../src/types/point'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    userEvent,
    waitFor,
} from '@testing-library/react-native'

jest.mock('react-native-safe-area-context', () => {
    return {
        useSafeAreaInsets: () => {
            return {
                bottom: 10,
            }
        },
        __esModule: true,
    }
})
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('react-native-gesture-handler', () => {})
jest.mock('react-native-permissions', () => {
    return {
        PERMISSIONS: {
            IOS: { APP_TRACKING_TRANSPARENCY: 'apptrackingtransparency' },
        },
        RESULTS: {},
        check: jest.fn(),
        checkLocationAccuracy: jest.fn(),
        checkMultiple: jest.fn(),
        checkNotifications: jest.fn(),
        openLimitedPhotoLibraryPicker: jest.fn(),
        openSettings: jest.fn(),
        request: jest.fn(),
        requestLocationAccuracy: jest.fn(),
        requestMultiple: jest.fn(),
        requestNotifications: jest.fn(),
    }
})
jest.mock('react-native-google-mobile-ads', () => {
    return {
        default: () => ({
            initialize: jest.fn(),
            setRequestConfiguration: jest.fn(),
        }),
        MaxAdContentRating: { T: 'T', PG: 'PG' },
        BannerAd: 'Ad',
        BannerAdSize: { BANNER: 'banner' },
        TestIds: { BANNER: 'bannertest' },
        __esModule: true,
    }
})

const mockedNavigate = jest.fn()
const mockedGoBack = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
            addListener: jest.fn().mockReturnValue(() => {}),
            goBack: mockedGoBack,
        }),
    }
})

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
        receivingTeam: { name: 'Sockeye' },
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
        receivingTeam: { name: 'Sockeye' },
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

const liveActions: LiveServerActionData[] = [
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

const game = GameFactory.build()
const gameStats = GameStatsFactory.build({ _id: game._id })

const client = new QueryClient({
    defaultOptions: {
        queries: {
            cacheTime: 0,
        },
    },
})

describe('ViewGameScreen', () => {
    const gameSpy = jest
        .spyOn(GameData, 'getGameById')
        .mockResolvedValue({ ...game, startTime: '2023' } as any)
    const pointsSpy = jest
        .spyOn(GameData, 'getPointsByGame')
        .mockResolvedValue(points)
    const gameStatsSpy = jest
        .spyOn(StatsData, 'getGameStats')
        .mockResolvedValue(gameStats)

    beforeAll(() => {
        userEvent.setup()
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(PointData, 'deleteLocalActionsByPoint').mockResolvedValue()
        jest.spyOn(PointData, 'getViewableActionsByPoint').mockResolvedValue(
            savedActions,
        )
        jest.spyOn(PointData, 'getLiveActionsByPoint').mockResolvedValue(
            liveActions,
        )
        jest.spyOn(GameData, 'getActiveGames').mockResolvedValue([
            { ...game, offline: false },
        ])
        jest.spyOn(GameData, 'logGameOpen').mockResolvedValue(game)
    })

    it('should match snapshot after data loaded', async () => {
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <ViewGameScreen {...props} />
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        await waitFor(() => {
            expect(screen.queryAllByText(game.teamOne.name).length).toBe(3)
        })

        expect(screen.getAllByText(game.teamTwo.name).length).toBe(1)

        expect(gameSpy).toHaveBeenCalled()
        expect(pointsSpy).toHaveBeenCalled()
        expect(gameStatsSpy).toHaveBeenCalled()
    }, 20000)

    it('should handle next point', async () => {
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <ViewGameScreen {...props} />
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        await waitFor(() => {
            expect(screen.getAllByText(game.teamOne.name)).toBeTruthy()
        })

        fireEvent.press(screen.getAllByText(game.teamOne.name)[1])

        expect(gameSpy).toHaveBeenCalled()
        expect(pointsSpy).toHaveBeenCalled()
    }, 20000)

    it('handles saved point functionality', async () => {
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <ViewGameScreen {...props} />
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        await waitFor(async () => {
            expect(screen.getAllByText(game.teamOne.name).length).toBe(3)
        })

        const savedPoint = screen.getAllByText(
            `${game.teamOne.name} (receive)`,
        )[1]
        fireEvent.press(savedPoint)

        await waitFor(async () => {
            expect(screen.queryAllByText('pickup').length).toBe(2)
        })
    }, 20000)

    it('handles live action select', async () => {
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <ViewGameScreen {...props} />
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        await waitFor(async () => {
            expect(screen.getAllByText(game.teamOne.name).length).toBe(3)
        })

        const livePoint = screen.getAllByText(game.teamOne.name)[2]
        fireEvent.press(livePoint)

        await waitFor(async () => {
            expect(screen.getByText('huck')).toBeTruthy()
        })

        fireEvent.press(screen.getByText('huck'))

        expect(mockedNavigate).toHaveBeenCalledWith('Comment', {
            gameId: 'game1',
            live: true,
            pointId: 'point3',
        })

        expect(store.getState().viewAction.liveAction).toMatchObject({
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
        })
        expect(store.getState().viewAction.teamOne).toMatchObject(game.teamOne)
        expect(store.getState().viewAction.teamTwo).toMatchObject(game.teamTwo)
    }, 20000)

    it('handles saved action select', async () => {
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <ViewGameScreen {...props} />
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        await waitFor(async () => {
            expect(screen.getAllByText(game.teamOne.name).length).toBe(3)
        })

        const savedPoint = screen.getAllByText(
            `${game.teamOne.name} (receive)`,
        )[1]
        fireEvent.press(savedPoint)

        await waitFor(async () => {
            expect(screen.queryAllByText('pickup')).toBeTruthy()
        })

        fireEvent.press(screen.queryAllByText('pickup')[0])

        expect(mockedNavigate).toHaveBeenCalledWith('Comment', {
            gameId: 'game1',
            live: false,
            pointId: 'point2',
        })

        expect(store.getState().viewAction.savedAction).toMatchObject({
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
        })
        expect(store.getState().viewAction.teamOne).toMatchObject(game.teamOne)
        expect(store.getState().viewAction.teamTwo).toMatchObject(game.teamTwo)
    }, 20000)

    it('reactivates game', async () => {
        jest.spyOn(GameData, 'getActiveGames').mockResolvedValue([])
        jest.spyOn(GameData, 'getGameById').mockResolvedValue({
            ...game,
            startTime: '2023',
            teamOneActive: false,
        } as any)
        store.dispatch(
            setProfile({
                ...fetchProfileData,
                managerTeams: [
                    {
                        _id: game.teamOne._id,
                        place: game.teamOne.place,
                        name: game.teamOne.name,
                        teamname: game.teamOne.teamname,
                        seasonStart: game.teamOne.seasonStart,
                        seasonEnd: game.teamOne.seasonEnd,
                    },
                ],
            }),
        )
        const spy = jest.spyOn(GameNetwork, 'reenterGame').mockReturnValueOnce(
            Promise.resolve({
                data: {
                    game: {
                        ...game,
                        startTime: '2023',
                        offline: false,
                    } as any,
                    team: 'one',
                    activePoint: undefined,
                    hasActiveActions: false,
                },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )

        jest.spyOn(StatsNetwork, 'getGameStats').mockResolvedValueOnce({
            data: { game: gameStats },
            status: 200,
            statusText: 'Good',
        } as AxiosResponse)
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <ViewGameScreen {...props} />
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )
        await waitFor(async () => {
            expect(screen.getAllByText(game.teamOne.name).length).toBe(3)
        })

        const button = screen.getByTestId('reactivate-button')
        fireEvent.press(button)

        await waitFor(() => {
            expect(spy).toHaveBeenCalled()
        })
    }, 20000)

    it('deletes game', async () => {
        store.dispatch(
            setProfile({
                ...fetchProfileData,
                managerTeams: [
                    {
                        _id: game.teamOne._id,
                        place: game.teamOne.place,
                        name: game.teamOne.name,
                        teamname: game.teamOne.teamname,
                        seasonStart: game.teamOne.seasonStart,
                        seasonEnd: game.teamOne.seasonEnd,
                    },
                ],
            }),
        )
        const spy = jest.spyOn(GameNetwork, 'deleteGame').mockReturnValue(
            Promise.resolve({
                data: undefined,
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )

        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <ViewGameScreen {...props} />
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )
        await waitFor(async () => {
            expect(screen.getAllByText(game.teamOne.name).length).toBe(3)
        })

        const button = screen.getByTestId('delete-button')
        fireEvent.press(button)

        const confirmBtn = screen.getByText('confirm')
        fireEvent.press(confirmBtn)

        await waitFor(async () => {
            expect(mockedGoBack).toHaveBeenCalled()
        })
        expect(spy).toHaveBeenCalled()
    }, 20000)

    it('exports stats', async () => {
        store.dispatch(
            setProfile({
                ...fetchProfileData,
                managerTeams: [
                    {
                        _id: game.teamOne._id,
                        place: game.teamOne.place,
                        name: game.teamOne.name,
                        teamname: game.teamOne.teamname,
                        seasonStart: game.teamOne.seasonStart,
                        seasonEnd: game.teamOne.seasonEnd,
                    },
                ],
            }),
        )
        const spy = jest
            .spyOn(StatsData, 'exportGameStats')
            .mockResolvedValueOnce(undefined)

        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <ViewGameScreen {...props} />
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )
        await waitFor(async () => {
            expect(screen.getAllByText(game.teamOne.name).length).toBe(3)
        })

        const button = screen.getByTestId('export-button')
        fireEvent.press(button)

        const confirmBtn = screen.getByText('confirm')
        fireEvent.press(confirmBtn)

        await waitFor(async () => {
            expect(spy).toHaveBeenCalled()
        })
    })

    it('displays stats', async () => {
        render(
            withRealm(
                <NavigationContainer>
                    <Provider store={store}>
                        <QueryClientProvider client={client}>
                            <ViewGameScreen {...props} />
                        </QueryClientProvider>
                    </Provider>
                </NavigationContainer>,
            ),
        )

        await waitFor(() => {
            expect(screen.queryAllByText(game.teamOne.name).length).toBe(3)
            expect(screen.queryAllByText('Overview').length).toBe(2)
        })

        // Unsuccessfully tried to navigate to overview tab, so using hidden elements
        expect(screen.getByText('Goals', { hidden: true })).toBeTruthy()
        expect(screen.getByText('Assists', { hidden: true })).toBeTruthy()
        expect(screen.getByText('Points Played', { hidden: true })).toBeTruthy()
        expect(screen.getByText('+ / -', { hidden: true })).toBeTruthy()
        expect(screen.getByText('Turnovers', { hidden: true })).toBeTruthy()
        expect(screen.getByText('Blocks', { hidden: true })).toBeTruthy()
    }, 20000)
})
