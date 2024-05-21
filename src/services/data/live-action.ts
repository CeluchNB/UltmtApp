import * as Constants from '../../utils/constants'
import Point from '../../types/point'
import { PointSchema } from '../../models'
import { TeamNumber } from '../../types/team'
import { getPointById as localGetPointById } from '../local/point'
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
        const savedAction = await localSaveAction(action, pointId)
        // TODO: GAME-REFACTOR
        // const point = await handleCreateActionSideEffects(savedAction)

        return {
            action: ActionFactory.createFromAction(savedAction),
            point: {} as Point,
        }
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

        // TODO: GAME-REFACTOR
        // const point = await handleUndoActionSideEffects(action, pointId)

        return { action, point: {} as Point }
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
): Promise<LiveServerActionData[]> => {
    try {
        const actions = await localGetActionsByPoint(pointId)
        return actions
    } catch (e) {
        return throwApiError(e, Constants.GET_ACTION_ERROR)
    }
}

export const handleCreateActionSideEffects = async (
    point: PointSchema,
    action: LiveServerActionData,
) => {
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

    // await localSavePoint(point)
    // return await localGetPointById(pointId)
}

export const handleUndoActionSideEffects = async (
    action: LiveServerActionData,
    point: PointSchema,
) => {
    const { teamNumber, actionNumber } = action
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
}
