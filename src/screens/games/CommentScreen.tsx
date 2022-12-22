import * as Constants from '../../utils/constants'
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
    SubscriptionObject,
} from '../../types/action'
import { addComment, addLiveComment } from '../../services/data/action'
import { joinPoint, subscribe, unsubscribe } from '../../services/data/action'
import {
    selectLiveAction,
    selectSavedAction,
    setLiveAction,
    setSavedAction,
} from '../../store/reducers/features/action/viewAction'
import { useDispatch, useSelector } from 'react-redux'

const CommentScreen: React.FC<CommentProps> = ({ route }) => {
    const { gameId, pointId, live } = route.params
    const { colors } = useColors()
    const dispatch = useDispatch()
    const liveAction = useSelector(selectLiveAction)
    const savedAction = useSelector(selectSavedAction)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const action = React.useMemo(() => {
        return (live ? liveAction : savedAction) as ServerAction
    }, [live, liveAction, savedAction])

    const subscriptions: SubscriptionObject = {
        client: (data: LiveServerAction) => {
            if (
                data.actionNumber === liveAction?.actionNumber &&
                data.teamNumber === liveAction.teamNumber
            ) {
                dispatch(setLiveAction(data))
            }
        },
        undo: () => {},
        error: () => {},
        point: () => {},
    }

    React.useEffect(() => {
        joinPoint(gameId, pointId)
        subscribe(subscriptions)
        return () => {
            unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const submitComment = async (comment: string) => {
        setLoading(true)
        try {
            if (!live) {
                const updatedAction = await addComment(
                    (action as SavedServerAction)._id,
                    pointId,
                    comment,
                )
                dispatch(setSavedAction(updatedAction))
            } else {
                await addLiveComment(
                    gameId,
                    pointId,
                    action.actionNumber,
                    (action as LiveServerAction).teamNumber,
                    comment,
                )
            }
        } catch (e: any) {
            setError(e?.message ?? Constants.COMMENT_ERROR)
        } finally {
            setLoading(false)
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
                <CommentInput
                    loading={loading}
                    error={error}
                    onSend={submitComment}
                />
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
