import { GuestUser } from '../../../src/types/user'
import Point from '../../../src/types/point'
import { Provider } from 'react-redux'
import React from 'react'
import SubstitutionModal from '../../../src/components/molecules/SubstitutionModal'
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

const playerList1 = [
    { firstName: 'First 1', lastName: 'Last 1' },
    { firstName: 'First 2', lastName: 'Last 2' },
    { firstName: 'First 3', lastName: 'Last 3' },
    { firstName: 'First 4', lastName: 'Last 4' },
    { firstName: 'First 5', lastName: 'Last 5' },
    { firstName: 'First 6', lastName: 'Last 6' },
    { firstName: 'First 7', lastName: 'Last 7' },
    { firstName: 'First 8', lastName: 'Last 8' },
    { firstName: 'First 9', lastName: 'Last 9' },
    { firstName: 'First 10', lastName: 'Last 10' },
    { _id: 'realid11', firstName: 'First 11', lastName: 'Last 11' },
]

const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    teamOnePlayers: playerList1.slice(0, 7),
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

beforeEach(() => {
    store.dispatch(
        setGame({
            ...game,
            teamOnePlayers: playerList1,
            tournament: undefined,
            startTime: '2022',
        }),
    )
    store.dispatch(setTeam('one'))
    store.dispatch(setPoint(point))
})

it('should match snapshot with team one', () => {
    const snapshot = render(
        <Provider store={store}>
            <SubstitutionModal
                visible={true}
                onClose={jest.fn()}
                onSubmit={jest.fn()}
            />
        </Provider>,
    )
    expect(snapshot.toJSON()).toMatchSnapshot()
    expect(snapshot.getAllByText(getPlayerName(playerList1[0]))).toBeTruthy()
    expect(snapshot.getByText(getPlayerName(playerList1[9]))).toBeTruthy()
})

it('should match snapshot with team two', () => {
    store.dispatch(
        setGame({
            ...game,
            teamTwoPlayers: playerList1,
            tournament: undefined,
            startTime: '2022',
        }),
    )
    store.dispatch(setTeam('two'))
    store.dispatch(
        setPoint({ ...point, teamTwoPlayers: playerList1.slice(0, 7) }),
    )
    const snapshot = render(
        <Provider store={store}>
            <SubstitutionModal
                visible={true}
                onClose={jest.fn()}
                onSubmit={jest.fn()}
            />
        </Provider>,
    )
    expect(snapshot.toJSON()).toMatchSnapshot()
    expect(snapshot.getAllByText(getPlayerName(playerList1[0]))).toBeTruthy()
    expect(snapshot.getByText(getPlayerName(playerList1[9]))).toBeTruthy()
})

it('should correctly make subsitution', async () => {
    const onSubmit = jest.fn()
    const { getAllByText, getByText } = render(
        <Provider store={store}>
            <SubstitutionModal
                visible={true}
                onClose={jest.fn()}
                onSubmit={onSubmit}
            />
        </Provider>,
    )

    const playerOne = getAllByText(getPlayerName(playerList1[0]))[0]
    const playerTwo = getByText(getPlayerName(playerList1[8]))

    fireEvent.press(playerOne)
    fireEvent.press(playerTwo)

    const submitBtn = getByText('substitute')
    fireEvent.press(submitBtn)

    await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(playerList1[0], playerList1[8])
    })
    expect(store.getState().livePoint.point.teamOnePlayers[0]).toBe(
        playerList1[8],
    )
})