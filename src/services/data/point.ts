import * as Constants from '../../utils/constants'
import { DisplayUser } from '../../types/user'
import { Game } from '../../types/game'
import Point from '../../types/point'
import { throwApiError } from '../../utils/service-utils'
import { withGameToken } from './game'
import { LiveServerAction, SavedServerAction } from '../../types/action'
import {
    activeGameId as localActiveGameId,
    activeGameOffline as localActiveGameOffline,
} from '../local/game'
import {
    createOfflinePoint as localCreateOfflinePoint,
    getPointById as localGetPointById,
    savePoint as localSavePoint,
} from '../local/point'
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
        const offline = await localActiveGameOffline()
        let pointId: string = ''
        if (offline) {
            pointId = await createOfflinePoint(pulling, pointNumber)
        } else {
            const response = await withGameToken(
                networkCreatePoint,
                pulling,
                pointNumber,
            )

            const { point } = response.data
            await localSavePoint(point)
        }
        const result = await localGetPointById(pointId)
        return result
    } catch (e: any) {
        return throwApiError(e, Constants.CREATE_POINT_ERROR)
    }
}

const createOfflinePoint = async (
    pulling: boolean,
    pointNumber: number,
): Promise<string> => {
    const gameId = await localActiveGameId()
    if (!gameId) {
        return throwApiError({}, Constants.GET_GAME_ERROR)
    }
    const id = await localCreateOfflinePoint(pulling, pointNumber, gameId)
    return id
}

/**
 * Method to select the players of a specific point
 * @param pointId id of point
 * @param players array of players (length must equal game's players per point value)
 * @returns updated point
 */
export const setPlayers = async (
    pointId: string,
    players: DisplayUser[],
): Promise<Point> => {
    try {
        const offline = await localActiveGameOffline()
        if (offline) {
            await updateOfflinePoint(pointId, { teamOnePlayers: players })
        } else {
            const response = await withGameToken(
                networkSetPlayers,
                pointId,
                players,
            )
            const { point } = response.data
            await localSavePoint(point)
        }
        const result = await localGetPointById(pointId)
        return result
    } catch (e) {
        return throwApiError(e, Constants.SET_PLAYERS_ERROR)
    }
}

const updateOfflinePoint = async (pointId: string, data: Partial<Point>) => {
    const point = await localGetPointById(pointId)
    const submit = { ...point, ...data }
    await localSavePoint(submit)
}

/**
 * Method to finish a point. In the backend this moves actions out of redis and to mongo.
 * @param pointId id of point to finish
 * @returns updated point
 */
export const finishPoint = async (pointId: string): Promise<Point> => {
    try {
        const offline = await localActiveGameOffline()
        if (offline) {
            // finish the point
        } else {
            const response = await withGameToken(networkFinishPoint, pointId)
            const { point } = response.data
            await localSavePoint(point)
        }

        const result = await localGetPointById(pointId)
        return result
    } catch (e: any) {
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
): Promise<LiveServerAction[]> => {
    try {
        const response = await networkGetLiveActionsByPoint(gameId, pointId)
        const { actions } = response.data
        return actions
    } catch (e) {
        return throwApiError(e, Constants.GET_POINT_ERROR)
    }
}

/**
 * Method to get the currently active point of a game that
 * is being reactivated locally
 * @param game resurrected game
 * @returns active point
 */
export const getActivePointForGame = async (
    game: Game,
): Promise<Point | undefined> => {
    try {
        if (game.points.length === 0) {
            return undefined
        }

        let activePoint: Point | undefined
        for (const id of game.points) {
            const localPoint = await localGetPointById(id)
            if (
                !activePoint ||
                localPoint.pointNumber > activePoint.pointNumber
            ) {
                activePoint = localPoint
            }
        }
        return activePoint
    } catch (e) {
        return throwApiError(e, Constants.GET_POINT_ERROR)
    }
}
