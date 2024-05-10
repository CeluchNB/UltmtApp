import { PointEditContext } from '../../../src/context/point-edit-context'
import { Provider } from 'react-redux'
import React from 'react'
import TeamActionView from '../../../src/components/organisms/TeamActionView'
import { game } from '../../../fixtures/data'
import { setPoint } from '../../../src/store/reducers/features/point/livePointReducer'
import store from '../../../src/store/store'
import { Action, ActionType } from '../../../src/types/action'
import Point, { PointStatus } from '../../../src/types/point'
import {
    addPlayers,
    setGame,
    setTeam,
} from '../../../src/store/reducers/features/game/liveGameReducer'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

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
    {
        _id: 'realid1',
        firstName: 'First 1',
        lastName: 'Last 1',
        username: 'firstlast1',
    },
    {
        _id: 'realid2',
        firstName: 'First 2',
        lastName: 'Last 2',
        username: 'firstlast2',
    },
    {
        _id: 'realid3',
        firstName: 'First 3',
        lastName: 'Last 3',
        username: 'firstlast3',
    },
    {
        _id: 'realid4',
        firstName: 'First 4',
        lastName: 'Last 4',
        username: 'firstlast4',
    },
    {
        _id: 'realid5',
        firstName: 'First 5',
        lastName: 'Last 5',
        username: 'firstlast5',
    },
    {
        _id: 'realid6',
        firstName: 'First 6',
        lastName: 'Last 6',
        username: 'firstlast6',
    },
    {
        _id: 'realid7',
        firstName: 'First 7',
        lastName: 'Last 7',
        username: 'firstlast7',
    },
    {
        _id: 'realid8',
        firstName: 'First 8',
        lastName: 'Last 8',
        username: 'firstlast8',
    },
    {
        _id: 'realid9',
        firstName: 'First 9',
        lastName: 'Last 9',
        username: 'firstlast9',
    },
    {
        _id: 'realid10',
        firstName: 'First 10',
        lastName: 'Last 10',
        username: 'firstlast10',
    },
    {
        _id: 'realid11',
        firstName: 'First 11',
        lastName: 'Last 11',
        username: 'firstlast11',
    },
]

const actions: Action[] = [
    {
        action: {
            actionNumber: Infinity,
            actionType: ActionType.TIMEOUT,
            playerOne: playerList1[0],
            tags: [],
            comments: [],
        },
        reporterDisplay: ActionType.TIMEOUT,
        viewerDisplay: 'Timeout called',
        setTags: jest.fn(),
        setPlayersAndUpdateViewerDisplay: jest.fn(),
    },
    {
        action: {
            actionNumber: Infinity,
            actionType: ActionType.TEAM_ONE_SCORE,
            tags: [],
            comments: [],
        },
        reporterDisplay: 'they score',
        viewerDisplay: 'They score',
        setTags: jest.fn(),
        setPlayersAndUpdateViewerDisplay: jest.fn(),
    },
    {
        action: {
            actionNumber: Infinity,
            actionType: ActionType.SUBSTITUTION,
            tags: [],
            comments: [],
        },
        reporterDisplay: ActionType.SUBSTITUTION,
        viewerDisplay: 'Substitution',
        setTags: jest.fn(),
        setPlayersAndUpdateViewerDisplay: jest.fn(),
    },
]

const teamOneActivePlayers = playerList1.slice(0, 7)

const props = {
    actions,
}

const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    teamOnePlayers: playerList1.slice(0, 7),
    teamOneActivePlayers,
    teamTwoPlayers: [],
    teamTwoActivePlayers: [],
    teamOneScore: 0,
    teamTwoScore: 0,
    pullingTeam: game.teamOne,
    receivingTeam: game.teamTwo,
    teamOneActions: [],
    teamTwoActions: [],
    gameId: 'game1',
    teamOneStatus: PointStatus.ACTIVE,
    teamTwoStatus: PointStatus.FUTURE,
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

beforeAll(() => {
    store.dispatch(addPlayers(playerList1))
    jest.useFakeTimers({ legacyFakeTimers: true })
})

afterAll(() => {
    jest.useRealTimers()
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
    const onAction = jest.fn()
    const { getByText } = render(
        <Provider store={store}>
            <PointEditContext.Provider
                value={
                    {
                        onAction,
                        activePlayers: teamOneActivePlayers,
                    } as any
                }>
                <TeamActionView {...props} />
            </PointEditContext.Provider>
        </Provider>,
    )
    fireEvent.press(getByText(ActionType.TIMEOUT.toString()))

    expect(onAction).toHaveBeenCalledWith(actions[0])
})

it('should handle non-substitution long press', async () => {
    const onAction = jest.fn()
    const { getByText, queryByText } = render(
        <Provider store={store}>
            <PointEditContext.Provider
                value={
                    {
                        onAction,
                        activePlayers: teamOneActivePlayers,
                    } as any
                }>
                <TeamActionView {...props} />
            </PointEditContext.Provider>
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
    expect(actions[0].setTags).toHaveBeenCalledWith(['huck'])
    expect(onAction).toHaveBeenCalledWith(actions[0])
})

it('should handle tag modal non submit', async () => {
    const onAction = jest.fn()
    const { getByText, queryByText, getAllByTestId } = render(
        <Provider store={store}>
            <PointEditContext.Provider
                value={
                    {
                        onAction: onAction,
                        activePlayers: teamOneActivePlayers,
                    } as any
                }>
                <TeamActionView {...props} />
            </PointEditContext.Provider>
        </Provider>,
    )

    expect(queryByText('Tags')).not.toBeTruthy()
    fireEvent(getByText(ActionType.TIMEOUT.toString()), 'onLongPress')
    expect(getByText('Tags')).toBeTruthy()

    fireEvent(getAllByTestId('base-modal')[1], 'onRequestClose')
    await waitFor(() => {
        expect(queryByText('Tags')).not.toBeTruthy()
    })
    expect(onAction).not.toHaveBeenCalledWith(actions[0])
})

it('should handle substitution press', async () => {
    const onAction = jest.fn()
    const { getByText, queryByText } = render(
        <Provider store={store}>
            <PointEditContext.Provider
                value={
                    {
                        onAction: onAction,
                        activePlayers: teamOneActivePlayers,
                    } as any
                }>
                <TeamActionView {...props} />
            </PointEditContext.Provider>
        </Provider>,
    )

    expect(queryByText('Player to Remove')).not.toBeTruthy()
    fireEvent.press(getByText(ActionType.SUBSTITUTION.toString()))
    expect(queryByText('Player to Remove')).toBeTruthy()

    fireEvent.press(getByText('First 1 Last 1'))
    fireEvent.press(getByText('First 10 Last 10'))
    fireEvent.press(getByText('substitute'))

    await waitFor(() => {
        expect(queryByText('Player to Remove')).not.toBeTruthy()
    })
    expect(actions[2].setPlayersAndUpdateViewerDisplay).toHaveBeenCalledWith(
        expect.objectContaining(playerList1[0]),
        expect.objectContaining(playerList1[9]),
    )
    expect(onAction).toHaveBeenCalledWith(actions[2])
})

it('should handle subsitution long press', async () => {
    const { getByText, queryByText } = render(
        <Provider store={store}>
            <PointEditContext.Provider
                value={
                    {
                        activePlayers: teamOneActivePlayers,
                    } as any
                }>
                <TeamActionView {...props} />
            </PointEditContext.Provider>
        </Provider>,
    )

    expect(queryByText('Player to Remove')).not.toBeTruthy()
    fireEvent(getByText(ActionType.SUBSTITUTION.toString()), 'onLongPress')
    await waitFor(() => {
        expect(getByText('Player to Remove')).toBeTruthy()
    })
})
