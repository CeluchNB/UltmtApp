import { FlatList } from 'react-native'
import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import Point from '../../types/point'
import PointAccordion from '../molecules/PointAccordion'
import { SavedServerAction } from '../../types/action'
import React, { useEffect } from 'react'
import {
    deleteAllActionsByPoint,
    getActionsByPoint,
} from '../../services/data/point'

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

    useEffect(() => {
        return () => {
            for (const point of points) {
                deleteAllActionsByPoint(point._id)
            }
        }
    }, [points])

    return (
        <List.AccordionGroup
            onAccordionPress={id => {
                if (id === expandedId) {
                    setExpandedId('')
                    return
                }
                const point = points.find(p => p._id === id)
                setLoading(true)
                getActionsByPoint(
                    'one',
                    id.toString(),
                    point
                        ? [...point.teamOneActions, ...point.teamTwoActions]
                        : [],
                )
                    .then(data => {
                        setActions(data)
                    })
                    .finally(() => {
                        setLoading(false)
                        setExpandedId(id.toString())
                    })
            }}
            expandedId={expandedId}>
            <FlatList
                data={points}
                renderItem={({ item: point }) => {
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
                }}
            />
        </List.AccordionGroup>
    )
}

export default PointAccordionGroup
