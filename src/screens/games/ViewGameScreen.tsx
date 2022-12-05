import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import { ActionType } from '../../types/action'
import BaseScreen from '../../components/atoms/BaseScreen'
import React from 'react'
import { ViewGameProps } from '../../types/navigation'

const ViewGameScreen: React.FC<ViewGameProps> = ({ route }) => {
    const {
        params: { gameId },
    } = route

    return (
        <BaseScreen containerWidth="80%">
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
            />
        </BaseScreen>
    )
}

export default ViewGameScreen
