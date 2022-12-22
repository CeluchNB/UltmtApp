import * as Constants from '../../utils/constants'
import EncryptedStorage from 'react-native-encrypted-storage'
import { saveActions as localSaveActions } from '../local/action'
import { addComment as networkAddComment } from '../network/action'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import {
    ClientAction,
    SavedServerAction,
    SubscriptionObject,
} from '../../types/action'
import {
    addComment as networkAddLiveComment,
    createAction as networkCreateAction,
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
 * Method to add a comment to a saved action.
 * @param actionId id of action
 * @param pointId id of point
 * @param comment comment text
 * @returns updated action
 */
export const addComment = async (
    actionId: string,
    pointId: string,
    comment: string,
): Promise<SavedServerAction> => {
    try {
        const response = await withToken(networkAddComment, actionId, comment)
        const { action } = response.data
        await localSaveActions(pointId, [action])
        return action
    } catch (error) {
        return throwApiError(error, Constants.COMMENT_ERROR)
    }
}
