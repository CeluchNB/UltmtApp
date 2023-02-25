import * as Constants from '../../utils/constants'
import { SavedServerActionData } from '../../types/action'
import { saveActions as localSaveActions } from '../local/action'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import {
    addComment as networkAddComment,
    deleteComment as networkDeleteComment,
} from '../network/saved-action'

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
): Promise<SavedServerActionData> => {
    try {
        const response = await withToken(networkAddComment, actionId, comment)
        const { action } = response.data
        await localSaveActions(pointId, [action])
        return action
    } catch (error) {
        return throwApiError(error, Constants.COMMENT_ERROR)
    }
}

/**
 * Method to delete a comment from a saved action.
 * @param actionId id of action
 * @param commentNumber number of comment
 * @param pointId id of point
 * @returns updated action
 */
export const deleteComment = async (
    actionId: string,
    commentNumber: string,
    pointId: string,
): Promise<SavedServerActionData> => {
    try {
        const response = await withToken(
            networkDeleteComment,
            actionId,
            commentNumber,
        )
        const { action } = response.data
        await localSaveActions(pointId, [action])
        return action
    } catch (error) {
        return throwApiError(error, Constants.COMMENT_ERROR)
    }
}
