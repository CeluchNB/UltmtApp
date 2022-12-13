import * as Constants from '../../utils/constants'
import { GuestUser } from '../../types/user'
import Point from '../../types/point'
import { throwApiError } from '../../utils/service-utils'
import { withGameToken } from './game'
import { LiveServerAction, SavedServerAction } from '../../types/action'
import {
    deleteAllActionsByPoint as localDeleteAllActionsByPoint,
    getActions as localGetActions,
    saveActions as localSaveActions,
} from '../local/action'
import {
    createPoint as networkCreatePoint,
    finishPoint as networkFinishPoint,
    getActionsByPoint as networkGetActionsByPoint,
    getLiveActionsByPoint as networkGetLiveActionsByPoint,
    setPlayers as networkSetPlayers,
} from '../network/point'

/**
 * Method to create a point
 * @param pulling boolean - calling team pulling or not
 * @param pointNumber number of point in the game
 * @returns created point
 */
export const createPoint = async (
    pulling: boolean,
    pointNumber: number,
): Promise<Point> => {
    try {
        const response = await withGameToken(
            networkCreatePoint,
            pulling,
            pointNumber,
        )

        const { point } = response.data
        return point
    } catch (e) {
        return throwApiError(e, Constants.CREATE_POINT_ERROR)
    }
}

/**
 * Method to select the players of a specific point
 * @param pointId id of point
 * @param players array of players (length must equal game's players per point value)
 * @returns updated point
 */
export const setPlayers = async (
    pointId: string,
    players: GuestUser[],
): Promise<Point> => {
    try {
        const response = await withGameToken(
            networkSetPlayers,
            pointId,
            players,
        )
        const { point } = response.data
        return point
    } catch (e) {
        return throwApiError(e, Constants.SET_PLAYERS_ERROR)
    }
}

/**
 * Method to finish a point. In the backend this moves actions out of redis and to mongo.
 * @param pointId id of point to finish
 * @returns updated point
 */
export const finishPoint = async (pointId: string): Promise<Point> => {
    try {
        const response = await withGameToken(networkFinishPoint, pointId)
        const { point } = response.data
        return point
    } catch (e) {
        return throwApiError(e, Constants.FINISH_POINT_ERROR)
    }
}

/**
 * Method to get actions belonging to a single team related to a point
 * @param team team 'one' or 'two'
 * @param pointId id of point
 * @returns List of server actions
 */
export const getActionsByPoint = async (
    team: 'one' | 'two',
    pointId: string,
    actionIds: string[],
): Promise<SavedServerAction[]> => {
    try {
        const localActions = await localGetActions(pointId, actionIds)
        if (localActions.length === 0) {
            const response = await networkGetActionsByPoint(team, pointId)
            const { actions: networkActions } = response.data

            const ids = networkActions.map(
                (action: SavedServerAction) => action._id,
            )

            await localSaveActions(pointId, networkActions)

            const actions = await localGetActions(pointId, ids)
            return actions
        }
        return localActions
    } catch (e) {
        return throwApiError(e, Constants.GET_POINT_ERROR)
    }
}

/**
 * Method to delete all actions for a specific point
 * @param pointId point id actions belong to
 */
export const deleteAllActionsByPoint = async (pointId: string) => {
    try {
        await localDeleteAllActionsByPoint(pointId)
    } catch (e) {
        // Do nothing for now
        return
    }
}

export const getLiveActionsByPoint = async (
    gameId: string,
    pointId: string,
): Promise<LiveServerAction[]> => {
    try {
        const response = await networkGetLiveActionsByPoint(gameId, pointId)
        const { actions } = response.data
        return actions
    } catch (e) {
        return throwApiError(e, Constants.GET_POINT_ERROR)
    }
}
