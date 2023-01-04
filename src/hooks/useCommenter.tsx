import * as Constants from '../utils/constants'
import React from 'react'
import { getUserId } from '../services/data/user'
import { isLoggedIn } from '../services/data/auth'
import { useData } from './'
import {
    LiveServerAction,
    SavedServerAction,
    ServerAction,
    SubscriptionObject,
} from '../types/action'
import { addComment, deleteComment } from '../services/data/saved-action'
import {
    addLiveComment,
    deleteLiveComment,
    joinPoint,
    subscribe,
    unsubscribe,
} from '../services/data/live-action'
import {
    selectLiveAction,
    selectSavedAction,
    selectTeams,
    setLiveAction,
    setSavedAction,
} from '../store/reducers/features/action/viewAction'
import { useDispatch, useSelector } from 'react-redux'

export const useCommenter = (
    gameId: string,
    pointId: string,
    live: boolean,
) => {
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
            // could get any action of this point here,
            // only update action if we received an update for this action
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

    // public
    const handleSubmitComment = async (comment: string) => {
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

    // public
    const handleDeleteComment = async (commentNumber: number) => {
        setError('')
        try {
            if (!live) {
                const updatedAction = await deleteComment(
                    (action as SavedServerAction)._id,
                    commentNumber.toString(),
                    pointId,
                )
                dispatch(setSavedAction(updatedAction))
            } else {
                await deleteLiveComment(
                    gameId,
                    pointId,
                    action.actionNumber,
                    (action as LiveServerAction).teamNumber,
                    commentNumber.toString(),
                )
            }
        } catch (e: any) {
            setError(e?.message ?? Constants.COMMENT_ERROR)
        }
    }

    return {
        action,
        teamOne,
        teamTwo,
        loading,
        error,
        isAuth,
        userId,
        handleSubmitComment,
        handleDeleteComment,
    }
}
