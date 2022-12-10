import { FlatList } from 'react-native'
import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import Point from '../../types/point'
import PointAccordion from '../molecules/PointAccordion'
import { normalizeActions } from '../../utils/point'
import {
    LiveServerAction,
    SavedServerAction,
    SubscriptionObject,
} from '../../types/action'
import React, { useEffect } from 'react'
import {
    deleteAllActionsByPoint,
    getActionsByPoint,
    getLiveActionsByPoint,
} from '../../services/data/point'
import { joinPoint, subscribe, unsubscribe } from '../../services/data/action'

interface PointAccordionGroupProps {
    gameId: string
    points: Point[]
    teamOne: GuestTeam
    teamTwo: GuestTeam
}

const PointAccordionGroup: React.FC<PointAccordionGroupProps> = ({
    gameId,
    points,
    teamOne,
    teamTwo,
}) => {
    const [loading, setLoading] = React.useState(false)
    const [actions, setActions] = React.useState<SavedServerAction[]>([])
    const [expandedId, setExpandedId] = React.useState('')
    const [liveActions, setLiveActions] = React.useState<LiveServerAction[]>([])

    const displayedActions = React.useCallback(
        (point: Point) => {
            return isLivePoint(point) ? normalizeActions(liveActions) : actions
        },
        [liveActions, actions],
    )

    useEffect(() => {
        return () => {
            unsubscribe()
            for (const point of points) {
                deleteAllActionsByPoint(point._id)
            }
        }
    }, [points])

    const isLivePoint = (point: Point): boolean => {
        return point.teamOneActive || point.teamTwoActive
    }

    const subscriptions: SubscriptionObject = {
        client: (data: LiveServerAction) => {
            setLiveActions(curr => [data, ...curr])
        },
        undo: () => {
            setLiveActions(curr => curr.slice(1))
        },
        error: () => {},
    }

    const getLiveActions = async (pointId: string) => {
        await joinPoint(gameId, pointId)
        await subscribe(subscriptions)
        const data = await getLiveActionsByPoint(gameId, pointId)
        // TODO: if user closes and opens accordion a bunch, liveActions could grow A LOT
        // think of way to remedy this
        // normalizeActions prevents this from being a display issue
        setLiveActions(curr => [...curr, ...data])
    }

    const getSavedActions = async (point: Point) => {
        const data = await getActionsByPoint('one', point._id.toString(), [
            ...point.teamOneActions,
            ...point.teamTwoActions,
        ])
        setActions(data)
    }

    const onAccordionPress = async (id: string | number) => {
        if (id === expandedId) {
            setExpandedId('')
            return
        }

        setExpandedId(id.toString())
        const point = points.find(p => p._id === id)
        if (!point) {
            return
        }
        setLoading(true)
        if (isLivePoint(point)) {
            await getLiveActions(point._id)
        } else {
            await getSavedActions(point)
        }
        setLoading(false)
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
                            actions={displayedActions(point)}
                            loading={loading}
                            teamOne={teamOne}
                            teamTwo={teamTwo}
                            isLive={isLivePoint(point)}
                        />
                    )
                }}
            />
        </List.AccordionGroup>
    )
}

export default PointAccordionGroup
