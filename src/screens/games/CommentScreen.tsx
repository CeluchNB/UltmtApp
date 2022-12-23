import * as Constants from '../../utils/constants'
import ActionDisplayItem from '../../components/atoms/ActionDisplayItem'
import BaseScreen from '../../components/atoms/BaseScreen'
import CommentInput from '../../components/atoms/CommentInput'
import CommentItem from '../../components/atoms/CommentItem'
import { CommentProps } from '../../types/navigation'
import React from 'react'
import { getUserId } from '../../services/data/user'
import { isLoggedIn } from '../../services/data/auth'
import { useColors } from '../../hooks/useColors'
import { useData } from '../../hooks'
import { FlatList, StyleSheet, View } from 'react-native'
import {
    LiveServerAction,
    SavedServerAction,
    ServerAction,
    SubscriptionObject,
} from '../../types/action'
import {
    addComment,
    addLiveComment,
    deleteLiveComment,
} from '../../services/data/action'
import { joinPoint, subscribe, unsubscribe } from '../../services/data/action'
import {
    selectLiveAction,
    selectSavedAction,
    selectTeams,
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
    const { teamOne, teamTwo } = useSelector(selectTeams)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const action = React.useMemo(() => {
        return (live ? liveAction : savedAction) as ServerAction
    }, [live, liveAction, savedAction])

    const { data: isAuth } = useData(isLoggedIn)
    const { data: userId } = useData(getUserId)

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
        error: (data: any) => {
            setError(data.message)
        },
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
        setError('')
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

    const deleteComment = async (commentNumber: number) => {
        setError('')
        try {
            if (!live) {
            } else {
                await deleteLiveComment(
                    gameId,
                    pointId,
                    action.actionNumber,
                    (action as LiveServerAction).teamNumber,
                    commentNumber.toString(),
                )
            }
        } catch (e) {}
    }

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            height: '100%',
        },
        commentContainer: {
            marginTop: 20,
            backgroundColor: colors.darkPrimary,
            flex: 1,
        },
        divider: {
            backgroundColor: colors.gray,
            height: 1,
        },
    })

    return (
        <BaseScreen containerWidth="100%">
            <View style={styles.container}>
                <ActionDisplayItem
                    action={action}
                    teamOne={teamOne || { name: 'team one' }}
                    teamTwo={teamTwo || { name: 'team two' }}
                />
                <View style={styles.commentContainer}>
                    <CommentInput
                        loading={loading}
                        error={error}
                        isLoggedIn={isAuth || false}
                        onSend={submitComment}
                    />
                    <FlatList
                        data={action.comments}
                        ItemSeparatorComponent={() => (
                            <View style={styles.divider} />
                        )}
                        renderItem={({ item }) => {
                            return (
                                <CommentItem
                                    userId={userId || ''}
                                    comment={item}
                                    onDelete={deleteComment}
                                />
                            )
                        }}
                    />
                </View>
            </View>
        </BaseScreen>
    )
}

export default CommentScreen
