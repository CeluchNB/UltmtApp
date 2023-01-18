import * as PointData from '../../../src/services/data/point'
import { LiveGameProps } from '../../../src/types/navigation'
import { NavigationContainer } from '@react-navigation/native'
import Point from '../../../src/types/point'
import { Provider } from 'react-redux'
import React from 'react'
import SelectPlayersScreen from '../../../src/screens/games/SelectPlayersScreen'
import { createPoint } from '../../../src/store/reducers/features/point/livePointReducer'
import { game } from '../../../fixtures/data'
import store from '../../../src/store/store'
import { DisplayUser, GuestUser } from '../../../src/types/user'
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

const navigate = jest.fn()
const reset = jest.fn()
const props: LiveGameProps = {
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
    teamOneScore: 0,
    teamTwoScore: 0,
    pullingTeam: game.teamOne,
    receivingTeam: game.teamTwo,
    teamOneActive: true,
    teamTwoActive: false,
    teamOneActions: [],
    teamTwoActions: [],
}

const getPlayerName = (player: GuestUser) => {
    return `${player.firstName} ${player.lastName}`
}

beforeAll(() => {
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
    store.dispatch(createPoint({ pulling: true, pointNumber: 1 }))
})

it('should match snapshot', () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <SelectPlayersScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should match snapshot for team two', () => {
    store.dispatch(setTeam('two'))
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <SelectPlayersScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should select players', async () => {
    store.dispatch(setTeam('one'))
    const spy = jest
        .spyOn(PointData, 'setPlayers')
        .mockReturnValueOnce(
            Promise.resolve({ ...point, teamOnePlayers: playerList1 }),
        )
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <SelectPlayersScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const player1 = getByText(getPlayerName(playerList1[0]))
    const player2 = getByText(getPlayerName(playerList1[1]))
    const player3 = getByText(getPlayerName(playerList1[2]))
    const player4 = getByText(getPlayerName(playerList1[3]))
    const player5 = getByText(getPlayerName(playerList1[4]))
    const player6 = getByText(getPlayerName(playerList1[5]))
    const player7 = getByText(getPlayerName(playerList1[6]))

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

    const button = getByText('start')
    fireEvent.press(button)

    await waitFor(() => {
        expect(spy).toHaveBeenCalledWith('point1', playerList1)
    })
})
