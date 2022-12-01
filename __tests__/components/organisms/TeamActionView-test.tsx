import Point from '../../../src/types/point'
import { Provider } from 'react-redux'
import React from 'react'
import TeamActionView from '../../../src/components/organisms/TeamActionView'
import { game } from '../../../fixtures/data'
import { setPoint } from '../../../src/store/reducers/features/point/livePointReducer'
import store from '../../../src/store/store'
import { ActionType, ClientActionType } from '../../../src/types/action'
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

const props = {
    actions: [
        ActionType.TIMEOUT,
        'score',
        ActionType.SUBSTITUTION,
    ] as ClientActionType[],
    onAction: jest.fn(),
}

const playerList1 = [
    { _id: 'realid1', firstName: 'First 1', lastName: 'Last 1' },
    { firstName: 'First 2', lastName: 'Last 2' },
    { firstName: 'First 3', lastName: 'Last 3' },
    { firstName: 'First 4', lastName: 'Last 4' },
    { firstName: 'First 5', lastName: 'Last 5' },
    { firstName: 'First 6', lastName: 'Last 6' },
    { firstName: 'First 7', lastName: 'Last 7' },
    { firstName: 'First 8', lastName: 'Last 8' },
    { firstName: 'First 9', lastName: 'Last 9' },
    { _id: 'realid10', firstName: 'First 10', lastName: 'Last 10' },
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
    props.onAction.mockClear()
})

it('should match snapshot', () => {
    const snapshot = render(
        <Provider store={store}>
            <TeamActionView {...props} />
        </Provider>,
    )
    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should handle non-substitution press', () => {
    const { getByText } = render(
        <Provider store={store}>
            <TeamActionView {...props} />
        </Provider>,
    )
    fireEvent.press(getByText(ActionType.TIMEOUT.toString()))

    expect(props.onAction).toHaveBeenCalledWith(ActionType.TIMEOUT, [])
})

it('should handle non-substitution long press', async () => {
    const { getByText, queryByText } = render(
        <Provider store={store}>
            <TeamActionView {...props} />
        </Provider>,
    )

    expect(queryByText('Tags')).not.toBeTruthy()
    fireEvent(getByText(ActionType.TIMEOUT.toString()), 'onLongPress')
    expect(getByText('Tags')).toBeTruthy()

    fireEvent.press(getByText('huck'))
    fireEvent.press(getByText('done'))
    await waitFor(() => {
        expect(queryByText('Tags')).not.toBeTruthy()
    })
    expect(props.onAction).toHaveBeenCalledWith(ActionType.TIMEOUT, ['huck'])
})

it('should handle tag modal non submit', async () => {
    const { getByText, queryByText, getAllByTestId } = render(
        <Provider store={store}>
            <TeamActionView {...props} />
        </Provider>,
    )

    expect(queryByText('Tags')).not.toBeTruthy()
    fireEvent(getByText(ActionType.TIMEOUT.toString()), 'onLongPress')
    expect(getByText('Tags')).toBeTruthy()

    fireEvent(getAllByTestId('base-modal')[1], 'onRequestClose')
    await waitFor(() => {
        expect(queryByText('Tags')).not.toBeTruthy()
    })
    expect(props.onAction).not.toHaveBeenCalledWith(ActionType.TIMEOUT, [
        'huck',
    ])
})

it('should handle substitution press', async () => {
    const { getByText, queryByText } = render(
        <Provider store={store}>
            <TeamActionView {...props} />
        </Provider>,
    )

    expect(queryByText('Player to Remove')).not.toBeTruthy()
    fireEvent.press(getByText(ActionType.SUBSTITUTION.toString()))
    expect(queryByText('Player to Remove')).toBeTruthy()

    fireEvent.press(getByText('First 1 Last 1'))
    fireEvent.press(getByText('First 10 Last 10'))
    fireEvent.press(getByText('substitute'))

    // fireEvent(getAllByTestId('base-modal')[0], 'onRequestClose')
    await waitFor(() => {
        expect(queryByText('Player to Remove')).not.toBeTruthy()
    })
    expect(props.onAction).toHaveBeenCalledWith(
        ActionType.SUBSTITUTION,
        [],
        playerList1[0],
        playerList1[9],
    )
})

it('should handle subsitution long press', async () => {
    const { getByText, queryByText } = render(
        <Provider store={store}>
            <TeamActionView {...props} />
        </Provider>,
    )

    expect(queryByText('Player to Remove')).not.toBeTruthy()
    fireEvent(getByText(ActionType.SUBSTITUTION.toString()), 'onLongPress')
    await waitFor(() => {
        expect(getByText('Player to Remove')).toBeTruthy()
    })
})
