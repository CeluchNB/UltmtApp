import { FlatList } from 'react-native'
import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import Point from '../../types/point'
import PointAccordion from '../molecules/PointAccordion'
import React from 'react'
import { ServerAction } from '../../types/action'

export interface PointAccordionGroupProps {
    activePointId?: string
    points: Point[]
    displayedActions: ServerAction[]
    teamOne: GuestTeam
    teamTwo: GuestTeam
    loading: boolean
    onSelectPoint: (pointId: string) => void
    onSelectAction: (action: ServerAction) => void
}

const PointAccordionGroup: React.FC<PointAccordionGroupProps> = ({
    activePointId,
    points,
    displayedActions,
    teamOne,
    teamTwo,
    loading,
    onSelectPoint,
    onSelectAction,
}) => {
    const [expandedId, setExpandedId] = React.useState('')

    React.useEffect(() => {
        setExpandedId(curr => activePointId || curr)
        if (activePointId) {
            onSelectPoint(activePointId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activePointId])

    const onAccordionPress = async (id: string | number) => {
        if (id === expandedId) {
            setExpandedId('')
            return
        }

        setExpandedId(id.toString())
        await onSelectPoint(id.toString())
    }

    return (
        <List.AccordionGroup
            onAccordionPress={onAccordionPress}
            expandedId={expandedId}>
            <FlatList
                data={points}
                renderItem={({ item: point }) => {
                    return (
                        <PointAccordion
                            key={point._id}
                            point={point}
                            expanded={point._id === expandedId}
                            actions={displayedActions}
                            loading={loading}
                            teamOne={teamOne}
                            teamTwo={teamTwo}
                            onActionPress={onSelectAction}
                        />
                    )
                }}
            />
        </List.AccordionGroup>
    )
}

export default PointAccordionGroup
