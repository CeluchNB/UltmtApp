import { FlatList } from 'react-native'
import { GameStackParamList } from '../../types/navigation'
import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Point from '../../types/point'
import PointAccordion from '../molecules/PointAccordion'
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import {
    LiveServerAction,
    SavedServerAction,
    ServerAction,
    SubscriptionObject,
} from '../../types/action'
import React, { useEffect } from 'react'
import {
    deleteAllActionsByPoint,
    getActionsByPoint,
    getLiveActionsByPoint,
} from '../../services/data/point'
import { joinPoint, subscribe, unsubscribe } from '../../services/data/action'
import { normalizeActions, normalizeLiveActions } from '../../utils/point'
import {
    setLiveAction,
    setSavedAction,
} from '../../store/reducers/features/action/viewAction'

export interface PointAccordionGroupProps {
    gameId: string
    points: Point[]
    teamOne: GuestTeam
    teamTwo: GuestTeam
    onNextPoint: () => void
}

const PointAccordionGroup: React.FC<PointAccordionGroupProps> = ({
    gameId,
    points,
    teamOne,
    teamTwo,
    onNextPoint,
}) => {
    const navigation =
        useNavigation<NativeStackNavigationProp<GameStackParamList>>()
    const dispatch = useDispatch()
    const [loading, setLoading] = React.useState(false)
    const [teamOneActions, setTeamOneActions] = React.useState<
        SavedServerAction[]
    >([])
    const [teamTwoActions, setTeamTwoActions] = React.useState<
        SavedServerAction[]
    >([])
    const [expandedId, setExpandedId] = React.useState('')
    const [liveActions, setLiveActions] = React.useState<LiveServerAction[]>([])

    const displayedActions = React.useCallback(
        (point: Point) => {
            return isLivePoint(point)
                ? normalizeLiveActions(liveActions)
                : normalizeActions(teamOneActions, teamTwoActions)
        },
        [liveActions, teamOneActions, teamTwoActions],
    )

    useEffect(() => {
        const removeListener = navigation.addListener('focus', async () => {
            await loadPoints(expandedId)
        })
        return () => {
            removeListener()
            unsubscribe()
            for (const point of points) {
                deleteAllActionsByPoint(point._id)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points, expandedId, teamOneActions, teamTwoActions, liveActions])

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
        point: () => {
            setLiveActions([])
            setExpandedId('')
            onNextPoint()
        },
    }

    const getLiveActions = async (pointId: string) => {
        setLiveActions([])
        await joinPoint(gameId, pointId)
        await subscribe(subscriptions)
        const data = await getLiveActionsByPoint(gameId, pointId)
        // TODO: if user closes and opens accordion a bunch, liveActions could grow A LOT
        // think of way to remedy this
        // normalizeActions prevents this from being a display issue
        setLiveActions(curr => [...curr, ...data])
    }

    const getSavedActions = async (point: Point) => {
        const oneActions = await getActionsByPoint(
            'one',
            point._id,
            point.teamOneActions,
        )
        setTeamOneActions(oneActions)
        const twoActions = await getActionsByPoint(
            'two',
            point._id,
            point.teamTwoActions,
        )
        setTeamTwoActions(twoActions)
    }

    const loadPoints = async (id: string | number) => {
        const point = points.find(p => p._id === id)
        if (!point) {
            return
        }
        setLoading(true)
        try {
            if (isLivePoint(point)) {
                await getLiveActions(point._id)
            } else {
                await getSavedActions(point)
            }
        } catch (e) {
        } finally {
            setLoading(false)
        }
    }

    const onAccordionPress = async (id: string | number) => {
        if (id === expandedId) {
            setExpandedId('')
            return
        }
        setExpandedId(id.toString())

        await loadPoints(id)
    }

    const onActionPress = (
        point: Point,
    ): ((action: ServerAction) => Promise<void>) => {
        return async (action: ServerAction) => {
            const live = isLivePoint(point)
            if (live) {
                dispatch(setLiveAction(action))
            } else {
                dispatch(setSavedAction(action))
            }
            navigation.navigate('Comment', {
                gameId,
                live,
                pointId: point._id,
            })
        }
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
                            onActionPress={onActionPress(point)}
                        />
                    )
                }}
            />
        </List.AccordionGroup>
    )
}

export default PointAccordionGroup
