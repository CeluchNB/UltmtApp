import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import BaseScreen from '../../components/atoms/BaseScreen'
import CommentItem from '../../components/atoms/CommentItem'
import { CommentProps } from '../../types/navigation'
import React from 'react'
import { ServerAction } from '../../types/action'
import { useColors } from '../../hooks/useColors'
import { useSelector } from 'react-redux'
import { FlatList, View } from 'react-native'
import {
    selectLiveAction,
    selectSavedAction,
} from '../../store/reducers/features/action/viewAction'

const CommentScreen: React.FC<CommentProps> = ({ route }) => {
    const { gameId, pointId, live } = route.params
    const { colors } = useColors()
    const liveAction = useSelector(selectLiveAction)
    const savedAction = useSelector(selectSavedAction)
    const action = React.useMemo(() => {
        return (live ? liveAction : savedAction) as ServerAction
    }, [live, liveAction, savedAction])
    return (
        <BaseScreen containerWidth="80%">
            <ActionDisplayItem
                action={action}
                teamOne={{ name: 'team 1' }}
                teamTwo={{ name: 'team 2' }}
            />
            <FlatList
                style={{ marginTop: 10 }}
                data={action.comments}
                ItemSeparatorComponent={() => (
                    <View style={{ backgroundColor: colors.gray, height: 1 }} />
                )}
                renderItem={({ item }) => {
                    return <CommentItem comment={item} onDelete={() => {}} />
                }}
            />
        </BaseScreen>
    )
}

export default CommentScreen
