import ActionDisplayItem from '../../../src/components/atoms/ActionDisplayItem'
import React from 'react'
import {
    ActionFactory,
    ActionType,
    LiveServerActionData,
    SavedServerActionData,
} from '../../../src/types/action'
import { fireEvent, render } from '@testing-library/react-native'

describe('ActionDisplayItem', () => {
    it('should match snapshot with server action', () => {
        const snapshot = render(
            <ActionDisplayItem
                action={ActionFactory.createFromAction({
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
                } as SavedServerActionData)}
                teamOne={{ name: 'Team 1' }}
                teamTwo={{ name: 'Team 2' }}
            />,
        )
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('match snapshot with live action', () => {
        const snapshot = render(
            <ActionDisplayItem
                action={ActionFactory.createFromAction({
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
                } as LiveServerActionData)}
                teamOne={{ name: 'Team 1' }}
                teamTwo={{ name: 'Team 2' }}
            />,
        )
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should handle press', () => {
        const onPress = jest.fn()

        const { getByText } = render(
            <ActionDisplayItem
                action={ActionFactory.createFromAction({
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
                } as SavedServerActionData)}
                teamOne={{ name: 'Team 1' }}
                teamTwo={{ name: 'Team 2' }}
                onPress={onPress}
            />,
        )

        const tag = getByText('break')
        fireEvent.press(tag)
        expect(onPress).toHaveBeenCalled()
    })
})
