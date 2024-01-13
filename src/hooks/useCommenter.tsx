import * as Constants from '../utils/constants'
import EncryptedStorage from 'react-native-encrypted-storage'
import React from 'react'
import { getUserId } from '../services/data/user'
import { isLoggedIn } from '../services/data/auth'
import useGameSocket from './useGameSocket'
import { useQuery } from 'react-query'
import {
    ActionFactory,
    LiveServerActionData,
    SavedServerActionData,
    ServerActionData,
    SubscriptionObject,
} from '../types/action'
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
    const gameSocket = useGameSocket()
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const action = React.useMemo(() => {
        return ActionFactory.createFromAction(
            (live ? liveAction : savedAction) as ServerActionData,
        )
    }, [live, liveAction, savedAction])

    const { data: isAuth } = useQuery(['isLoggedIn'], () => isLoggedIn(), {
        cacheTime: 0,
    })
    const { data: userId } = useQuery(['getUserId'], () => getUserId(), {
        cacheTime: 0,
    })

    const subscriptions: SubscriptionObject = {
        client: (data: LiveServerActionData) => {
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
            // TODO: SOCKET - this probably displays other users errors
            setError(data.message)
        },
        point: () => {},
    }

    React.useEffect(() => {
        if (!live) return

        // TODO: new socket implementation
        gameSocket.subscribe(subscriptions, gameId, pointId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameId, pointId])

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
                // TODO: new socket implementation
                const jwt =
                    (await EncryptedStorage.getItem('access_token')) || ''
                gameSocket.emit(
                    'action:comment',
                    JSON.stringify({
                        jwt,
                        gameId,
                        pointId,
                        actionNumber: action.action.actionNumber,
                        teamNumber: (action.action as LiveServerActionData)
                            .teamNumber,
                        comment,
                    }),
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
                // TODO: new socket implementation
                const jwt =
                    (await EncryptedStorage.getItem('access_token')) || ''

                gameSocket.emit(
                    'action:comment:delete',
                    JSON.stringify({
                        jwt,
                        gameId,
                        pointId,
                        actionNumber: action.action.actionNumber,
                        teamNumber: (action.action as LiveServerActionData)
                            .teamNumber,
                        commentNumber: commentNumber,
                    }),
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
