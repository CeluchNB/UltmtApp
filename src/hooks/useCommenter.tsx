import * as Constants from '../utils/constants'
import EncryptedStorage from 'react-native-encrypted-storage'
import { getUserId } from '../services/data/user'
import { isLoggedIn } from '../services/data/auth'
import useLivePoint from './useLivePoint'
import usePointSocket from './usePointSocket'
import { useQuery } from 'react-query'
import {
    ActionFactory,
    SavedServerActionData,
    ServerActionData,
} from '../types/action'
import React, { useEffect } from 'react'
import { addComment, deleteComment } from '../services/data/saved-action'
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
    const emitter = usePointSocket(gameId, pointId)
    const {
        actionStack,
        error: liveError,
        onComment,
        onDeleteComment,
    } = useLivePoint(emitter)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const action = React.useMemo(() => {
        return ActionFactory.createFromAction(
            (live ? liveAction : savedAction) as ServerActionData,
        )
    }, [live, liveAction, savedAction])

    useEffect(() => {
        const newAction = actionStack.getAction(
            liveAction?.teamNumber ?? 'one',
            liveAction?.actionNumber ?? 0,
        )
        if (newAction) {
            dispatch(setLiveAction(newAction))
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionStack])

    const { data: isAuth } = useQuery(['isLoggedIn'], () => isLoggedIn(), {
        cacheTime: 0,
    })
    const { data: userId } = useQuery(['getUserId'], () => getUserId(), {
        cacheTime: 0,
    })

    // public
    const handleSubmitComment = async (comment: string) => {
        setLoading(true)
        setError('')
        try {
            if (!live) {
                const updatedAction = await addComment(
                    (action.action as SavedServerActionData)._id,
                    pointId,
                    comment,
                )
                dispatch(setSavedAction(updatedAction))
            } else {
                const jwt =
                    (await EncryptedStorage.getItem('access_token')) || ''

                onComment(
                    jwt,
                    liveAction?.actionNumber ?? 0,
                    liveAction?.teamNumber ?? 'one',
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
                    (action.action as SavedServerActionData)._id,
                    commentNumber.toString(),
                    pointId,
                )
                dispatch(setSavedAction(updatedAction))
            } else {
                const jwt =
                    (await EncryptedStorage.getItem('access_token')) || ''

                onDeleteComment(
                    jwt,
                    liveAction?.actionNumber ?? 0,
                    liveAction?.teamNumber ?? 'one',
                    commentNumber,
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
        error: liveError ?? error,
        isAuth,
        userId,
        handleSubmitComment,
        handleDeleteComment,
    }
}
