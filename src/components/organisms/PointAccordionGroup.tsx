import { FlatList } from 'react-native'
import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import Point from '../../types/point'
import PointAccordion from '../molecules/PointAccordion'
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

    const subscriptions: SubscriptionObject = {
        client: (data: LiveServerAction) => {
            setLiveActions(curr => [data, ...curr])
        },
        undo: () => {
            setLiveActions(curr => curr.slice(1))
        },
        error: () => {},
    }

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

    return (
        <List.AccordionGroup
            onAccordionPress={async id => {
                if (id === expandedId) {
                    setExpandedId('')
                    return
                }

                setExpandedId(id.toString())
                const point = points.find(p => p._id === id)
                if (!point) {
                    return
                }
                if (isLivePoint(point)) {
                    setLoading(true)
                    await joinPoint(gameId, point._id)
                    await subscribe(subscriptions)
                    const data = await getLiveActionsByPoint(gameId, point._id)
                    setLiveActions(curr => [...curr, ...data])
                    setLoading(false)
                    return
                } else {
                    setLoading(true)
                    const data = await getActionsByPoint('one', id.toString(), [
                        ...point.teamOneActions,
                        ...point.teamTwoActions,
                    ])
                    setActions(data)
                    setLoading(false)
                }
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
                            actions={isLivePoint(point) ? liveActions : actions}
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
