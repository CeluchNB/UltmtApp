import { PointEditContext } from '../../../src/context/point-edit-context'
import React from 'react'
import TeamActionView from '../../../src/components/organisms/TeamActionView'
import { Action, ActionType } from '../../../src/types/action'
import {
    LiveGameContext,
    LiveGameContextData,
} from '../../../src/context/live-game-context'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

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

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})

afterAll(() => {
    jest.useRealTimers()
})

it('should match snapshot', () => {
    const snapshot = render(<TeamActionView {...props} />)
    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should handle non-substitution press', () => {
    const onAction = jest.fn()
    render(
        <PointEditContext.Provider
            value={
                {
                    onAction,
                    activePlayers: teamOneActivePlayers,
                } as any
            }>
            <TeamActionView {...props} />
        </PointEditContext.Provider>,
    )
    fireEvent.press(screen.getByText(ActionType.TIMEOUT.toString()))

    expect(onAction).toHaveBeenCalledWith(actions[0])
})

it('should handle non-substitution long press', async () => {
    const onAction = jest.fn()
    render(
        <LiveGameContext.Provider
            value={
                {
                    tags: ['huck'],
                    addTag: jest.fn(),
                } as unknown as LiveGameContextData
            }>
            <PointEditContext.Provider
                value={
                    {
                        onAction,
                        activePlayers: teamOneActivePlayers,
                    } as any
                }>
                <TeamActionView {...props} />
            </PointEditContext.Provider>
        </LiveGameContext.Provider>,
    )

    expect(screen.queryByText('Tags')).not.toBeTruthy()
    fireEvent(screen.getByText(ActionType.TIMEOUT.toString()), 'onLongPress')
    expect(screen.getByText('Tags')).toBeTruthy()

    fireEvent.press(screen.getByText('huck'))
    fireEvent.press(screen.getByText('done'))
    await waitFor(() => {
        expect(screen.queryByText('Tags')).not.toBeTruthy()
    })
    expect(actions[0].setTags).toHaveBeenCalledWith(['huck'])
    expect(onAction).toHaveBeenCalledWith(actions[0])
})

xit('should handle tag modal non submit', async () => {
    const onAction = jest.fn()
    render(
        <PointEditContext.Provider
            value={
                {
                    onAction: onAction,
                    activePlayers: teamOneActivePlayers,
                } as any
            }>
            <TeamActionView {...props} />
        </PointEditContext.Provider>,
    )

    expect(screen.queryByText('Tags')).not.toBeTruthy()
    fireEvent(screen.getByText(ActionType.TIMEOUT.toString()), 'onLongPress')
    expect(screen.getByText('Tags')).toBeTruthy()

    fireEvent(screen.getAllByTestId('base-modal')[1], 'onRequestClose')
    await waitFor(() => {
        expect(screen.queryByText('Tags')).not.toBeTruthy()
    })
    expect(onAction).not.toHaveBeenCalledWith(actions[0])
})

it('should handle substitution press', async () => {
    const onAction = jest.fn()
    render(
        <LiveGameContext.Provider
            value={{ players: playerList1 } as LiveGameContextData}>
            <PointEditContext.Provider
                value={
                    {
                        onAction: onAction,
                        activePlayers: teamOneActivePlayers,
                    } as any
                }>
                <TeamActionView {...props} />
            </PointEditContext.Provider>
        </LiveGameContext.Provider>,
    )

    expect(screen.queryByText('Player to Remove')).not.toBeTruthy()
    fireEvent.press(screen.getByText(ActionType.SUBSTITUTION.toString()))
    expect(screen.queryByText('Player to Remove')).toBeTruthy()

    fireEvent.press(screen.getByText('First 1 Last 1'))
    fireEvent.press(screen.getByText('First 10 Last 10'))
    fireEvent.press(screen.getByText('substitute'))

    await waitFor(() => {
        expect(screen.queryByText('Player to Remove')).not.toBeTruthy()
    })
    expect(actions[2].setPlayersAndUpdateViewerDisplay).toHaveBeenCalledWith(
        expect.objectContaining(playerList1[0]),
        expect.objectContaining(playerList1[9]),
    )
    expect(onAction).toHaveBeenCalledWith(actions[2])
})

it('should handle subsitution long press', async () => {
    render(
        <PointEditContext.Provider
            value={
                {
                    activePlayers: teamOneActivePlayers,
                } as any
            }>
            <TeamActionView {...props} />
        </PointEditContext.Provider>,
    )

    expect(screen.queryByText('Player to Remove')).not.toBeTruthy()
    fireEvent(
        screen.getByText(ActionType.SUBSTITUTION.toString()),
        'onLongPress',
    )
    await waitFor(() => {
        expect(screen.getByText('Player to Remove')).toBeTruthy()
    })
})
