import * as PointData from '../../../src/services/data/point'
import * as TeamData from '../../../src/services/data/team'
import { NavigationContainer } from '@react-navigation/native'
import Point from '../../../src/types/point'
import { Provider } from 'react-redux'
import React from 'react'
import { SelectPlayersProps } from '../../../src/types/navigation'
import SelectPlayersScreen from '../../../src/screens/games/SelectPlayersScreen'
import { Team } from '../../../src/types/team'
import { game } from '../../../fixtures/data'
import store from '../../../src/store/store'
import { DisplayUser, GuestUser } from '../../../src/types/user'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    addPlayers,
    resetGame,
    setGame,
    setTeam,
} from '../../../src/store/reducers/features/game/liveGameReducer'
import {
    createPoint,
    resetPoint,
} from '../../../src/store/reducers/features/point/livePointReducer'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const reset = jest.fn()
const props: SelectPlayersProps = {
    navigation: {
        navigate,
        reset,
    } as any,
    route: {} as any,
}

const playerList1: DisplayUser[] = [
    {
        _id: 'user1',
        firstName: 'First 1',
        lastName: 'Last 1',
        username: 'firstlast1',
    },
    {
        _id: 'user2',
        firstName: 'First 2',
        lastName: 'Last 2',
        username: 'firstlast2',
    },
    {
        _id: 'user3',
        firstName: 'First 3',
        lastName: 'Last 3',
        username: 'firstlast3',
    },
    {
        _id: 'user4',
        firstName: 'First 4',
        lastName: 'Last 4',
        username: 'firstlast4',
    },
    {
        _id: 'user5',
        firstName: 'First 5',
        lastName: 'Last 5',
        username: 'firstlast5',
    },
    {
        _id: 'user6',
        firstName: 'First 6',
        lastName: 'Last 6',
        username: 'firstlast6',
    },
    {
        _id: 'user7',
        firstName: 'First 7',
        lastName: 'Last 7',
        username: 'firstlast7',
    },
]

const playerList2: DisplayUser[] = [
    {
        _id: 'user8',
        firstName: 'First 8',
        lastName: 'Last 8',
        username: 'firstlast8',
    },
    {
        _id: 'user9',
        firstName: 'First 9',
        lastName: 'Last 9',
        username: 'firstlast9',
    },
    {
        _id: 'user10',
        firstName: 'First 10',
        lastName: 'Last 10',
        username: 'firstlast10',
    },
    {
        _id: 'user11',
        firstName: 'First 11',
        lastName: 'Last 11',
        username: 'firstlast11',
    },
    {
        _id: 'user12',
        firstName: 'First 12',
        lastName: 'Last 12',
        username: 'firstlast12',
    },
    {
        _id: 'user13',
        firstName: 'First 13',
        lastName: 'Last 13',
        username: 'firstlast13',
    },
    {
        _id: 'user14',
        firstName: 'First 14',
        lastName: 'Last 14',
        username: 'firstlast14',
    },
]

const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    teamOnePlayers: [],
    teamTwoPlayers: [],
    teamOneActivePlayers: [],
    teamTwoActivePlayers: [],
    teamOneScore: 0,
    teamTwoScore: 0,
    pullingTeam: game.teamOne,
    receivingTeam: game.teamTwo,
    teamOneActive: true,
    teamTwoActive: false,
    teamOneActions: [],
    teamTwoActions: [],
}

const team: Team = {
    _id: 'id1',
    place: 'Place',
    name: 'Name',
    teamname: 'placename',
    managers: [],
    players: [],
    seasonNumber: 1,
    seasonStart: '2022',
    seasonEnd: '2022',
    continuationId: 'id123',
    rosterOpen: true,
    requests: [],
}

const client = new QueryClient()

const getPlayerName = (player: GuestUser) => {
    return `${player.firstName} ${player.lastName} (0/0/0/0/0)`
}

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})

afterAll(() => {
    jest.useRealTimers()
})

beforeEach(() => {
    jest.resetAllMocks()
    store.dispatch(resetGame())
    store.dispatch(resetPoint())
    store.dispatch(
        setGame({
            ...game,
            teamOnePlayers: playerList1,
            teamTwoPlayers: playerList2,
            tournament: undefined,
            startTime: '2022',
        }),
    )

    jest.spyOn(PointData, 'createPoint').mockReturnValue(Promise.resolve(point))
    jest.spyOn(TeamData, 'getTeamById').mockReturnValue(Promise.resolve(team))
    store.dispatch(createPoint({ pulling: true, pointNumber: 1 }))
})

describe('SelectPlayersScreen', () => {
    it('should match snapshot', () => {
        store.dispatch(addPlayers(playerList1))
        const snapshot = render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <SelectPlayersScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>
            </Provider>,
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should match snapshot for team two', () => {
        store.dispatch(setTeam('two'))
        store.dispatch(addPlayers(playerList2))
        const snapshot = render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <SelectPlayersScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>
            </Provider>,
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should display set pulling team modal', () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <SelectPlayersScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>
            </Provider>,
        )

        const setPullingBtn = screen.getByText('CHANGE PULLING TEAM')
        fireEvent.press(setPullingBtn)

        expect(screen.getByText('Choose pulling team')).toBeTruthy()
    })

    it('should select players', async () => {
        store.dispatch(addPlayers(playerList1))
        store.dispatch(setTeam('one'))
        const spy = jest
            .spyOn(PointData, 'setPlayers')
            .mockReturnValueOnce(
                Promise.resolve({ ...point, teamOnePlayers: playerList1 }),
            )
        render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <SelectPlayersScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>
            </Provider>,
        )

        const player1 = screen.getByText(getPlayerName(playerList1[0]))
        const player2 = screen.getByText(getPlayerName(playerList1[1]))
        const player3 = screen.getByText(getPlayerName(playerList1[2]))
        const player4 = screen.getByText(getPlayerName(playerList1[3]))
        const player5 = screen.getByText(getPlayerName(playerList1[4]))
        const player6 = screen.getByText(getPlayerName(playerList1[5]))
        const player7 = screen.getByText(getPlayerName(playerList1[6]))

        fireEvent.press(player1)
        fireEvent.press(player2)
        fireEvent.press(player3)
        fireEvent.press(player4)
        fireEvent.press(player5)
        fireEvent.press(player6)
        fireEvent.press(player7)
        // deselect and reselect player
        fireEvent.press(player7)
        fireEvent.press(player7)

        const button = screen.getByText('start')
        fireEvent.press(button)

        await waitFor(() => {
            expect(spy).toHaveBeenCalledWith(
                'point1',
                expect.arrayContaining([
                    expect.objectContaining(playerList1[0]),
                    expect.objectContaining(playerList1[1]),
                    expect.objectContaining(playerList1[2]),
                    expect.objectContaining(playerList1[3]),
                    expect.objectContaining(playerList1[4]),
                    expect.objectContaining(playerList1[5]),
                    expect.objectContaining(playerList1[6]),
                ]),
            )
        })
    })

    it('should display confirmation modal when point mismatches', async () => {
        store.dispatch(addPlayers(playerList1))
        store.dispatch(setTeam('one'))
        const spy = jest.spyOn(PointData, 'setPlayers').mockReturnValueOnce(
            Promise.resolve({
                ...point,
                pullingTeam: { ...point.pullingTeam, _id: 'newid' },
                teamOnePlayers: playerList1,
            }),
        )
        render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <SelectPlayersScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>
            </Provider>,
        )

        const player1 = screen.getByText(getPlayerName(playerList1[0]))
        const player2 = screen.getByText(getPlayerName(playerList1[1]))
        const player3 = screen.getByText(getPlayerName(playerList1[2]))
        const player4 = screen.getByText(getPlayerName(playerList1[3]))
        const player5 = screen.getByText(getPlayerName(playerList1[4]))
        const player6 = screen.getByText(getPlayerName(playerList1[5]))
        const player7 = screen.getByText(getPlayerName(playerList1[6]))

        fireEvent.press(player1)
        fireEvent.press(player2)
        fireEvent.press(player3)
        fireEvent.press(player4)
        fireEvent.press(player5)
        fireEvent.press(player6)
        fireEvent.press(player7)

        const button = screen.getByText('start')
        fireEvent.press(button)

        await waitFor(() => {
            expect(spy).toHaveBeenCalledWith(
                'point1',
                expect.arrayContaining([
                    expect.objectContaining(playerList1[0]),
                    expect.objectContaining(playerList1[1]),
                    expect.objectContaining(playerList1[2]),
                    expect.objectContaining(playerList1[3]),
                    expect.objectContaining(playerList1[4]),
                    expect.objectContaining(playerList1[5]),
                    expect.objectContaining(playerList1[6]),
                ]),
            )
        })

        expect(
            screen.getByText(
                'The stat keeper for the other team has switched the pulling and receiving teams. Do you wish to continue?',
            ),
        ).toBeTruthy()
    })
})
