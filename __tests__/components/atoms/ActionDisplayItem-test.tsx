import ActionDisplayItem from '../../../src/components/atoms/ActionDisplayItem'
import { ActionType } from '../../../src/types/action'
import React from 'react'
import { render } from '@testing-library/react-native'

it('should match snapshot with server action', () => {
    const snapshot = render(
        <ActionDisplayItem
            action={{
                _id: '',
                actionType: ActionType.CATCH,
                actionNumber: 1,
                playerOne: { firstName: 'Noah', lastName: 'Celuch' },
                playerTwo: {
                    firstName: 'Connor',
                    lastName: 'Tipping',
                },
                tags: ['break', 'huck'],
                comments: [
                    {
                        user: {
                            firstName: 'First',
                            lastName: 'last',
                        },
                        comment: 'nice',
                        commentNumber: 1,
                    },
                ],
                team: {
                    _id: '',
                    place: 'Pittsburgh',
                    name: 'Temper',
                    teamname: 'temper',
                    seasonStart: '2022',
                    seasonEnd: '2022',
                },
            }}
            teamOne={{ name: 'Team 1' }}
            teamTwo={{ name: 'Team 2' }}
        />,
    )
    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('match snapshot with live action', () => {
    const snapshot = render(
        <ActionDisplayItem
            action={{
                _id: '',
                actionType: ActionType.CATCH,
                actionNumber: 1,
                playerOne: { firstName: 'Noah', lastName: 'Celuch' },
                playerTwo: {
                    firstName: 'Connor',
                    lastName: 'Tipping',
                },
                tags: ['break', 'huck'],
                comments: [
                    {
                        user: {
                            firstName: 'First',
                            lastName: 'last',
                        },
                        comment: 'nice',
                        commentNumber: 1,
                    },
                ],
                teamNumber: 'two',
            }}
            teamOne={{ name: 'Team 1' }}
            teamTwo={{ name: 'Team 2' }}
        />,
    )
    expect(snapshot.toJSON()).toMatchSnapshot()
})
