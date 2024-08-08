import * as Constants from '../../utils/constants'
import { TeamNumber } from '../../types/team'
import { throwApiError } from '../../utils/service-utils'
import {
    Action,
    ActionFactory,
    LiveServerActionData,
    SavedServerActionData,
} from '../../types/action'
import {
    deleteAllDisplayActionsByPoint as localDeleteAllActionsByPoint,
    getDisplayActions as localGetDisplayActions,
    saveDisplayActions as localSaveDisplayActions,
} from '../local/action'
import {
    getActionsByPoint as networkGetActionsByPoint,
    getLiveActionsByPoint as networkGetLiveActionsByPoint,
} from '../network/point'

/**
 * Method to get actions belonging to a single team related to a point
 * @param team team 'one' or 'two'
 * @param pointId id of point
 * @returns List of server actions
 */
export const getViewableActionsByPoint = async (
    team: TeamNumber,
    pointId: string,
    actionIds: string[],
): Promise<Action[]> => {
    try {
        const localActions = await localGetDisplayActions(pointId, actionIds)
        if (localActions.length === 0) {
            const response = await networkGetActionsByPoint(team, pointId)
            const { actions: networkActions } = response.data

            const ids = networkActions.map(
                (action: SavedServerActionData) => action._id,
            )

            await localSaveDisplayActions(pointId, networkActions)

            const savedActions = await localGetDisplayActions(pointId, ids)
            const actions = savedActions.map(action => {
                return ActionFactory.createFromAction(action)
            })
            return actions
        }
        const actions = localActions.map(action => {
            return ActionFactory.createFromAction(action)
        })
        return actions
    } catch (e) {
        return []
    }
}

/**
 * Method to delete all actions for a specific point
 * @param pointId point id actions belong to
 */
export const deleteLocalActionsByPoint = async (pointId: string) => {
    try {
        await localDeleteAllActionsByPoint(pointId)
    } catch (e) {
        // Do nothing for now
        return
    }
}

/**
 * Method to get current live actions associated with a point
 * @param gameId id of game
 * @param pointId id of point
 * @returns list of actions
 */
export const getLiveActionsByPoint = async (
    gameId: string,
    pointId: string,
): Promise<LiveServerActionData[]> => {
    try {
        const response = await networkGetLiveActionsByPoint(gameId, pointId)
        const { actions } = response.data

        return actions
    } catch (e) {
        return throwApiError(e, Constants.GET_POINT_ERROR)
    }
}
