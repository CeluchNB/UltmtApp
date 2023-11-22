import { DisplayUser } from '../../../src/types/user'
import PlayerActionItem from '../../../src/components/molecules/PlayerActionItem'
import { Provider } from 'react-redux'
import React from 'react'
import { debounce } from 'lodash'
import store from '../../../src/store/store'
import { Action, ActionType } from '../../../src/types/action'
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

const player: DisplayUser = {
    _id: 'user1',
    firstName: 'First',
    lastName: 'Last',
    username: 'firstlast',
}

describe('PlayerActionItem', () => {
    const actions: Action[] = [
        {
            action: {
                actionType: ActionType.BLOCK,
                playerOne: player,
                tags: [],
                actionNumber: 1,
                comments: [],
            },
            reporterDisplay: 'Block',
            viewerDisplay: 'Player blocks',
            setPlayersAndUpdateViewerDisplay: jest.fn(),
            setTags: jest.fn(),
        },
        {
            action: {
                actionType: ActionType.CATCH,
                playerOne: player,
                tags: [],
                actionNumber: 1,
                comments: [],
            },
            reporterDisplay: 'Catch',
            viewerDisplay: 'Player catches',
            setPlayersAndUpdateViewerDisplay: jest.fn(),
            setTags: jest.fn(),
        },
        {
            action: {
                actionType: ActionType.TEAM_ONE_SCORE,
                playerOne: player,
                tags: [],
                actionNumber: 1,
                comments: [],
            },
            reporterDisplay: 'score',
            viewerDisplay: 'Player scores',
            setPlayersAndUpdateViewerDisplay: jest.fn(),
            setTags: jest.fn(),
        },
    ]
    it('should match snapshot', () => {
        const snapshot = render(
            <Provider store={store}>
                <PlayerActionItem
                    player={player}
                    actions={actions}
                    onAction={debounce(jest.fn())}
                    loading={false}
                />
            </Provider>,
        )
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should call action appropriately', async () => {
        const spy = jest.fn()
        const { getByText } = render(
            <Provider store={store}>
                <PlayerActionItem
                    player={player}
                    actions={actions}
                    onAction={debounce(spy)}
                    loading={false}
                />
            </Provider>,
        )

        const scoreBtn = getByText('score')
        fireEvent.press(scoreBtn)
        await waitFor(() => {
            expect(spy).toHaveBeenCalledWith(actions[2])
        })
    })

    it('should handle tag call', async () => {
        const spy = jest.fn()
        const { getByText } = render(
            <Provider store={store}>
                <PlayerActionItem
                    player={player}
                    actions={actions}
                    onAction={debounce(spy)}
                    loading={false}
                />
            </Provider>,
        )

        const scoreBtn = getByText('score')
        fireEvent(scoreBtn, 'onLongPress')

        const huckBtn = getByText('huck')
        fireEvent.press(huckBtn)

        const doneBtn = getByText('done')
        fireEvent.press(doneBtn)

        expect(actions[2].setTags).toHaveBeenCalledWith(['huck'])

        await waitFor(() => {
            expect(spy).toHaveBeenCalledWith({
                ...actions[2],
            })
        })
    })
})
