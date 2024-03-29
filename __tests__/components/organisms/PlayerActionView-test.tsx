import { DisplayUser } from '../../../src/types/user'
import PlayerActionView from '../../../src/components/organisms/PlayerActionView'
import { PointEditContext } from '../../../src/context/point-edit-context'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../../src/store/store'
import { ActionType, LiveServerActionData } from '../../../src/types/action'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

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

const actionStack: LiveServerActionData[] = [
    {
        actionType: ActionType.CATCH,
        actionNumber: 1,
        playerOne: playerList1[2],
        playerTwo: playerList1[3],
        tags: [],
        teamNumber: 'one',
        comments: [],
    },
]

describe('PlayerActionView', () => {
    it('should match snapshot', () => {
        const snapshot = render(
            <Provider store={store}>
                <PointEditContext.Provider
                    value={
                        {
                            activePlayers: playerList1,
                            onAction: jest.fn(),
                        } as any
                    }>
                    <PlayerActionView
                        pulling={false}
                        loading={true}
                        actionStack={actionStack}
                        team={'one'}
                    />
                </PointEditContext.Provider>
            </Provider>,
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should call action', async () => {
        const actionFn = jest.fn()
        const { getAllByText } = render(
            <Provider store={store}>
                <PointEditContext.Provider
                    value={
                        {
                            activePlayers: playerList1,
                            onAction: actionFn,
                        } as any
                    }>
                    <PlayerActionView
                        pulling={false}
                        loading={false}
                        actionStack={actionStack}
                        team={'one'}
                    />
                </PointEditContext.Provider>
            </Provider>,
        )

        const catchBtn = getAllByText(ActionType.CATCH)[0]
        fireEvent.press(catchBtn)

        const action = {
            action: {
                playerOne: playerList1[0],
                playerTwo: playerList1[2],
                actionType: ActionType.CATCH,
                tags: [],
                comments: [],
                actionNumber: Infinity,
            },
            reporterDisplay: ActionType.CATCH,
            viewerDisplay:
                'First 1 Last 1 catches the disc from First 3 Last 3',
        }
        await waitFor(() => {
            expect(actionFn).toHaveBeenCalledWith(action)
        })
    })
})
