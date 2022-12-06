import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import Point from '../../types/point'
import PointAccordion from '../molecules/PointAccordion'
import React from 'react'
import { SavedServerAction } from '../../types/action'
import { getActionsByPoint } from '../../services/data/point'

interface PointAccordionGroupProps {
    points: Point[]
    teamOne: GuestTeam
    teamTwo: GuestTeam
}

const PointAccordionGroup: React.FC<PointAccordionGroupProps> = ({
    points,
    teamOne,
    teamTwo,
}) => {
    const [loading, setLoading] = React.useState(false)
    const [actions, setActions] = React.useState<SavedServerAction[]>([])
    const [expandedId, setExpandedId] = React.useState('')

    return (
        <List.AccordionGroup
            onAccordionPress={id => {
                console.log('got press', id)
                setLoading(true)
                getActionsByPoint('one', id.toString())
                    .then(data => {
                        console.log('got actions', data)
                        setActions(data)
                    })
                    .finally(() => {
                        setLoading(false)
                        setExpandedId(id.toString())
                    })
            }}
            expandedId={expandedId}>
            {points.map(point => {
                return (
                    <PointAccordion
                        key={point._id}
                        point={point}
                        expanded={point._id === expandedId}
                        actions={actions}
                        loading={loading}
                        teamOne={teamOne}
                        teamTwo={teamTwo}
                    />
                )
            })}
        </List.AccordionGroup>
    )
}

export default PointAccordionGroup
