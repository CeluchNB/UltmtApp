import * as Constants from '../../utils/constants'
import EncryptedStorage from 'react-native-encrypted-storage'
import { refreshTokenIfNecessary } from './auth'
import { throwApiError } from '../../utils/service-utils'
import {
    ActionType,
    ClientAction,
    LiveServerAction,
    SubscriptionObject,
} from '../../types/action'
import {
    deleteAction as localDeleteAction,
    getActionsByPoint as localGetActionsByPoint,
    upsertAction as localSaveAction,
} from '../local/action'
import {
    getPointById as localGetPointById,
    savePoint as localSavePoint,
} from '../local/point'
import {
    addComment as networkAddLiveComment,
    createAction as networkCreateAction,
    deleteComment as networkDeleteLiveComment,
    joinPoint as networkJoinPoint,
    nextPoint as networkNextPoint,
    subscribe as networkSubscribe,
    undoAction as networkUndoAction,
    unsubscribe as networkUnsubscribe,
} from '../network/live-action'

/**
 * Method to join a point
 * @param gameId id of game to join
 * @param pointId id of point to join
 */
export const joinPoint = async (gameId: string, pointId: string) => {
    await networkJoinPoint(gameId, pointId)
}

/**
 * Method to create an action
 * @param action action data
 * @param pointId point action belongs to
 */
export const addAction = async (action: ClientAction, pointId: string) => {
    await networkCreateAction(action, pointId)
}

/**
 * Method to undo an action
 * @param pointId undo last action on point of this id
 */
export const undoAction = async (pointId: string) => {
    await networkUndoAction(pointId)
}

/**
 * Method to add a comment to a live action
 * @param gameId id of game
 * @param pointId id of point
 * @param actionNumber action number
 * @param teamNumber 'one' | 'two' - team reporting action
 * @param comment comment text
 */
export const addLiveComment = async (
    gameId: string,
    pointId: string,
    actionNumber: number,
    teamNumber: 'one' | 'two',
    comment: string,
) => {
    try {
        await refreshTokenIfNecessary()
    } catch (e) {
        // do nothing, just let the comment fail
    }
    const token = (await EncryptedStorage.getItem('access_token')) || ''
    await networkAddLiveComment(
        token,
        gameId,
        pointId,
        actionNumber,
        teamNumber,
        comment,
    )
}

/**
 * Method to delete a live comment
 * @param gameId id of game
 * @param pointId id of point
 * @param actionNumber action number of point
 * @param teamNumber team that submitted action - 'one' | 'two'
 * @param commentNumber comment number
 */
export const deleteLiveComment = async (
    gameId: string,
    pointId: string,
    actionNumber: number,
    teamNumber: 'one' | 'two',
    commentNumber: string,
) => {
    try {
        await refreshTokenIfNecessary()
    } catch (e) {
        // do nothing, just let the action fail
    }
    const token = (await EncryptedStorage.getItem('access_token')) || ''
    await networkDeleteLiveComment(
        token,
        gameId,
        pointId,
        actionNumber,
        teamNumber,
        commentNumber,
    )
}

/**
 * Method to indicate the next point has been started
 * @param pointId id of point that was just finished
 */
export const nextPoint = async (pointId: string) => {
    await networkNextPoint(pointId)
}

/**
 * Method to listen to specific action events
 * @param subscriptions object containing subscription types and methods
 */
export const subscribe = async (subscriptions: SubscriptionObject) => {
    await networkSubscribe(subscriptions)
}

/**
 * Method to unsubscribe from all action websckets
 */
export const unsubscribe = () => {
    networkUnsubscribe()
}

/**
 * Save action locally
 * @param action action data
 * @param pointId point action belongs to
 * @returns live server action
 */
export const saveLocalAction = async (
    action: LiveServerAction,
    pointId: string,
): Promise<LiveServerAction> => {
    try {
        if (action.actionType === ActionType.SUBSTITUTION) {
            if (action.playerTwo) {
                const point = await localGetPointById(pointId)
                if (action.teamNumber === 'one') {
                    point.teamOnePlayers.push(action.playerTwo)
                } else {
                    point.teamTwoPlayers.push(action.playerTwo)
                }
                await localSavePoint(point)
            }
        }
        return await localSaveAction(action, pointId)
    } catch (e) {
        return throwApiError({}, Constants.GET_ACTION_ERROR)
    }
}

/**
 * Method to create an offline action
 * @param action action data
 * @param pointId point id
 * @returns live server action
 */
export const createOfflineAction = async (
    action: ClientAction,
    pointId: string,
): Promise<LiveServerAction> => {
    try {
        const point = await localGetPointById(pointId)
        const liveAction: LiveServerAction = {
            ...action,
            teamNumber: 'one',
            comments: [],
            actionNumber: point.teamOneActions.length + 1,
        }
        const newAction = await saveLocalAction(liveAction, pointId)
        return newAction
    } catch (e) {
        return throwApiError({}, Constants.GET_ACTION_ERROR)
    }
}

/**
 * Deletes a single action
 * @param teamNumber team reporting action
 * @param actionNumber action number
 * @param pointId point id of action
 */
export const deleteLocalAction = async (
    teamNumber: 'one' | 'two',
    actionNumber: number,
    pointId: string,
): Promise<LiveServerAction> => {
    try {
        return await localDeleteAction(teamNumber, actionNumber, pointId)
    } catch (e) {
        return throwApiError({}, Constants.GET_ACTION_ERROR)
    }
}

export const undoOfflineAction = async (
    pointId: string,
): Promise<LiveServerAction> => {
    try {
        const point = await localGetPointById(pointId)
        const actionNumber = point.teamOneActions.length
        return await deleteLocalAction('one', actionNumber, pointId)
    } catch (e) {
        return throwApiError({}, Constants.GET_ACTION_ERROR)
    }
}

/**
 * Method to get currently saved actions for a point
 * @param pointId point action belongs to
 * @param teamNumber specific team to get
 * @returns list of live actions
 */
export const getLocalActionsByPoint = async (
    pointId: string,
): Promise<LiveServerAction[]> => {
    try {
        return await localGetActionsByPoint(pointId)
    } catch (e) {
        return throwApiError(e, Constants.GET_ACTION_ERROR)
    }
}
