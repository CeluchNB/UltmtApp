import { FlatList } from 'react-native'
import { GameStackParamList } from '../../types/navigation'
import { GuestTeam } from '../../types/team'
import { List } from 'react-native-paper'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Point from '../../types/point'
import PointAccordion from '../molecules/PointAccordion'
import { ServerAction } from '../../types/action'
import { deleteLocalActionsByPoint } from '../../services/data/point'
import { unsubscribe } from '../../services/data/live-action'
import { useDispatch } from 'react-redux'
import { useGameViewer } from '../../hooks'
import { useNavigation } from '@react-navigation/native'
import React, { useEffect } from 'react'
import {
    setLiveAction,
    setSavedAction,
    setTeams,
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
    // onNextPoint,
}) => {
    const navigation =
        useNavigation<NativeStackNavigationProp<GameStackParamList>>()
    const dispatch = useDispatch()
    const [expandedId, setExpandedId] = React.useState('')

    const { displayedActions, loading, onSelectPoint } = useGameViewer(gameId)

    useEffect(() => {
        const removeListener = navigation.addListener('focus', async () => {
            await onSelectPoint(expandedId)
        })
        return () => {
            removeListener()
            unsubscribe()
            for (const point of points) {
                deleteLocalActionsByPoint(point._id)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [points, expandedId])

    const isLivePoint = (point: Point): boolean => {
        return point.teamOneActive || point.teamTwoActive
    }

    const onAccordionPress = async (id: string | number) => {
        if (id === expandedId) {
            setExpandedId('')
            return
        }

        setExpandedId(id.toString())
        await onSelectPoint(id.toString())
    }

    const onActionPress = (
        point: Point,
    ): ((action: ServerAction) => Promise<void>) => {
        return async (action: ServerAction) => {
            const live = isLivePoint(point)
            if (live) {
                dispatch(setTeams({ teamOne, teamTwo }))
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
                            actions={displayedActions}
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
