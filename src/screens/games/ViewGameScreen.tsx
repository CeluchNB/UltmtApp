import { ActionType } from '../../types/action'
import BaseScreen from '../../components/atoms/BaseScreen'
import PointAccordionGroup from '../../components/organisms/PointAccordionGroup'
import { PopulatedPoint } from '../../types/point'
import React from 'react'
import { ViewGameProps } from '../../types/navigation'

const ViewGameScreen: React.FC<ViewGameProps> = () => {
    // const {
    //     params: { gameId },
    // } = route

    const points: PopulatedPoint[] = [
        {
            _id: 'point1',
            pointNumber: 1,
            teamOneScore: 1,
            teamTwoScore: 0,
            teamOnePlayers: [],
            teamTwoPlayers: [],
            teamOneActions: [],
            teamTwoActions: [],
            teamOneActive: false,
            teamTwoActive: false,
            pullingTeam: { name: 'Temper' },
            receivingTeam: { name: 'Truck Stop' },
            actions: [
                {
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
                },
                {
                    _id: '',
                    actionType: ActionType.CATCH,
                    actionNumber: 2,
                    playerOne: { firstName: 'Amy', lastName: 'Celuch' },
                    playerTwo: {
                        firstName: 'Noah',
                        lastName: 'Celuch',
                    },
                    tags: ['huck'],
                    comments: [],
                    team: {
                        _id: '',
                        place: 'Pittsburgh',
                        name: 'Temper',
                        teamname: 'temper',
                        seasonStart: '2022',
                        seasonEnd: '2022',
                    },
                },
            ],
        },
        {
            _id: 'point2',
            pointNumber: 1,
            teamOneScore: 1,
            teamTwoScore: 0,
            teamOnePlayers: [],
            teamTwoPlayers: [],
            teamOneActions: [],
            teamTwoActions: [],
            teamOneActive: false,
            teamTwoActive: false,
            pullingTeam: { name: 'Temper' },
            receivingTeam: { name: 'Truck Stop' },
            actions: [
                {
                    _id: 'action1',
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
                },
                {
                    _id: 'action2',
                    actionType: ActionType.CATCH,
                    actionNumber: 2,
                    playerOne: { firstName: 'Amy', lastName: 'Celuch' },
                    playerTwo: {
                        firstName: 'Noah',
                        lastName: 'Celuch',
                    },
                    tags: ['huck'],
                    comments: [],
                    team: {
                        _id: '',
                        place: 'Pittsburgh',
                        name: 'Temper',
                        teamname: 'temper',
                        seasonStart: '2022',
                        seasonEnd: '2022',
                    },
                },
            ],
        },
    ]

    return (
        <BaseScreen containerWidth="100%">
            <PointAccordionGroup
                points={points}
                teamOne={{ name: 'Temper' }}
                teamTwo={{ name: 'Truck Stop' }}
            />
        </BaseScreen>
    )
}

export default ViewGameScreen
