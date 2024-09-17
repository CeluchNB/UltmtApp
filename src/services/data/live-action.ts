import * as Constants from '../../utils/constants'
import { PointSchema } from '../../models'
import { getActionsByPoint as localGetActionsByPoint } from '../local/action'
import { throwApiError } from '../../utils/service-utils'
import { ActionType, LiveServerActionData } from '../../types/action'
import {
    removePlayerFromArray,
    substituteActivePlayer,
} from '../../utils/point'

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
