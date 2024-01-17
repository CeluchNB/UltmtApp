import * as Constants from '../../utils/constants'
import Point from '../../types/point'
import { TeamNumber } from '../../types/team'
import { throwApiError } from '../../utils/service-utils'
import {
    Action,
    ActionFactory,
    ActionType,
    ClientActionData,
    LiveServerActionData,
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
    removePlayerFromArray,
    substituteActivePlayer,
} from '../../utils/point'

/**
 * Save action locally
 * @param action action data
 * @param pointId point action belongs to
 * @returns live server action
 */
export const saveLocalAction = async (
    action: LiveServerActionData,
    pointId: string,
): Promise<{ action: Action; point: Point }> => {
    try {
        console.log('saving local action', action)
        const savedAction = await localSaveAction(action, pointId)
        const point = await handleCreateActionSideEffects(savedAction)

        return { action: ActionFactory.createFromAction(savedAction), point }
    } catch (e) {
        console.log('got error', e)
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
    action: ClientActionData,
    pointId: string,
): Promise<{ action: Action; point: Point }> => {
    try {
        const point = await localGetPointById(pointId)
        const liveAction: LiveServerActionData = {
            ...action,
            teamNumber: 'one',
            comments: [],
            actionNumber: point.teamOneActions.length + 1,
        }

        return await saveLocalAction(liveAction, pointId)
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
    teamNumber: TeamNumber,
    actionNumber: number,
    pointId: string,
): Promise<{ action: LiveServerActionData; point: Point }> => {
    try {
        const action = await localDeleteAction(
            teamNumber,
            actionNumber,
            pointId,
        )

        const point = await handleUndoActionSideEffects(action, pointId)

        return { action, point }
    } catch (e) {
        return throwApiError({}, Constants.GET_ACTION_ERROR)
    }
}

export const undoOfflineAction = async (
    pointId: string,
): Promise<{ action: LiveServerActionData; point: Point }> => {
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
): Promise<Action[]> => {
    try {
        const actions = await localGetActionsByPoint(pointId)
        return actions.map(action => ActionFactory.createFromAction(action))
    } catch (e) {
        return throwApiError(e, Constants.GET_ACTION_ERROR)
    }
}

const handleCreateActionSideEffects = async (
    action: LiveServerActionData & { _id: string; pointId: string },
): Promise<Point> => {
    const { pointId } = action
    const point = await localGetPointById(pointId)
    if (action.teamNumber === 'one') {
        if (action.actionType === ActionType.SUBSTITUTION) {
            if (action.playerOne && action.playerTwo) {
                substituteActivePlayer(
                    point.teamOneActivePlayers,
                    action.playerOne,
                    action.playerTwo,
                )
                point.teamOnePlayers.push(action.playerTwo)
            }
        }
        point.teamOneActions = [
            ...new Set([...point.teamOneActions, action._id]),
        ]
    } else {
        if (action.actionType === ActionType.SUBSTITUTION) {
            if (action.playerOne && action.playerTwo) {
                substituteActivePlayer(
                    point.teamTwoActivePlayers,
                    action.playerOne,
                    action.playerTwo,
                )
                point.teamTwoPlayers.push(action.playerTwo)
            }
        }
        // TODO: add point team one actions
    }

    await localSavePoint(point)
    return await localGetPointById(pointId)
}

const handleUndoActionSideEffects = async (
    action: LiveServerActionData,
    pointId: string,
): Promise<Point> => {
    const { teamNumber, actionNumber } = action
    const point = await localGetPointById(pointId)
    if (teamNumber === 'one') {
        point.teamOneActions.splice(actionNumber - 1)

        if (action.actionType === ActionType.SUBSTITUTION) {
            if (action.playerOne && action.playerTwo) {
                substituteActivePlayer(
                    point.teamOneActivePlayers,
                    action.playerTwo,
                    action.playerOne,
                )
                removePlayerFromArray(point.teamOnePlayers, action.playerTwo)
            }
        }
    } else {
        point.teamTwoActions.splice(actionNumber - 1)

        if (action.actionType === ActionType.SUBSTITUTION) {
            if (action.playerOne && action.playerTwo) {
                substituteActivePlayer(
                    point.teamTwoActivePlayers,
                    action.playerTwo,
                    action.playerOne,
                )
                removePlayerFromArray(point.teamTwoPlayers, action.playerTwo)
            }
        }
    }

    await localSavePoint(point)
    return await localGetPointById(pointId)
}
