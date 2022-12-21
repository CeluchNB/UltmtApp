import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import BaseScreen from '../../components/atoms/BaseScreen'
import CommentInput from '../../components/atoms/CommentInput'
import CommentItem from '../../components/atoms/CommentItem'
import { CommentProps } from '../../types/navigation'
import React from 'react'
import { useColors } from '../../hooks/useColors'
import { FlatList, StyleSheet, View } from 'react-native'
import {
    LiveServerAction,
    SavedServerAction,
    ServerAction,
} from '../../types/action'
import { addComment, addLiveComment } from '../../services/data/action'
import {
    selectLiveAction,
    selectSavedAction,
    setSavedAction,
} from '../../store/reducers/features/action/viewAction'
import { useDispatch, useSelector } from 'react-redux'

const CommentScreen: React.FC<CommentProps> = ({ route }) => {
    const { gameId, pointId, live } = route.params
    const { colors } = useColors()
    const dispatch = useDispatch()
    const liveAction = useSelector(selectLiveAction)
    const savedAction = useSelector(selectSavedAction)

    const action = React.useMemo(() => {
        return (live ? liveAction : savedAction) as ServerAction
    }, [live, liveAction, savedAction])

    const submitComment = async (comment: string) => {
        if (!live) {
            const updatedAction = await addComment(
                (action as SavedServerAction)._id,
                pointId,
                comment,
            )
            dispatch(setSavedAction(updatedAction))
            console.log('updated', updatedAction.comments.length)
        } else {
            await addLiveComment(
                gameId,
                pointId,
                action.actionNumber,
                (action as LiveServerAction).teamNumber,
                comment,
            )
        }
    }

    const styles = StyleSheet.create({
        container: {
            marginTop: 20,
            backgroundColor: colors.darkPrimary,
            height: '80%',
        },
        divider: {
            backgroundColor: colors.gray,
            height: 1,
        },
    })

    return (
        <BaseScreen containerWidth="100%">
            <ActionDisplayItem
                action={action}
                teamOne={{ name: 'team 1' }}
                teamTwo={{ name: 'team 2' }}
            />
            <View style={styles.container}>
                <CommentInput loading={false} onSend={submitComment} />
                <FlatList
                    data={action.comments}
                    ItemSeparatorComponent={() => (
                        <View style={styles.divider} />
                    )}
                    renderItem={({ item }) => {
                        return (
                            <CommentItem comment={item} onDelete={() => {}} />
                        )
                    }}
                />
            </View>
        </BaseScreen>
    )
}

export default CommentScreen
