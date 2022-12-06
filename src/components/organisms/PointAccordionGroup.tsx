import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import PointAccordion from '../molecules/PointAccordion'
import { PopulatedPoint } from '../../types/point'
import React from 'react'

interface PointAccordionGroupProps {
    points: PopulatedPoint[]
    teamOne: GuestTeam
    teamTwo: GuestTeam
}

const PointAccordionGroup: React.FC<PointAccordionGroupProps> = ({
    points,
    teamOne,
    teamTwo,
}) => {
    return (
        <List.AccordionGroup>
            {points.map(point => {
                return (
                    <PointAccordion
                        point={point}
                        actions={point.actions}
                        teamOne={teamOne}
                        teamTwo={teamTwo}
                    />
                )
            })}
        </List.AccordionGroup>
    )
}

export default PointAccordionGroup
