import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import Point from '../../types/point'
import PointAccordion from '../molecules/PointAccordion'
import React from 'react'
import { useTheme } from '../../hooks'
import { Action, ServerActionData } from '../../types/action'
import { FlatList, RefreshControl } from 'react-native'

export interface PointAccordionGroupProps {
    activePointId?: string
    points: Point[]
    displayedActions: (Action | { ad: boolean })[]
    teamOne: GuestTeam
    teamTwo: GuestTeam
    loading: boolean
    error: string
    onSelectPoint: (pointId: string) => void
    onSelectAction: (action: ServerActionData) => void
    onRefresh: () => Promise<void>
}

const PointAccordionGroup: React.FC<PointAccordionGroupProps> = ({
    activePointId,
    points,
    displayedActions,
    teamOne,
    teamTwo,
    loading,
    error,
    onSelectPoint,
    onSelectAction,
    onRefresh,
}) => {
    const {
        theme: { colors },
    } = useTheme()
    const [expandedId, setExpandedId] = React.useState('')
    const [refreshing, setRefreshing] = React.useState(false)

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
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        colors={[colors.textSecondary]}
                        tintColor={colors.textSecondary}
                        onRefresh={async () => {
                            setRefreshing(true)
                            await onRefresh()
                            setRefreshing(false)
                        }}
                    />
                }
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
                            error={error}
                            onActionPress={onSelectAction}
                        />
                    )
                }}
            />
        </List.AccordionGroup>
    )
}

export default PointAccordionGroup
