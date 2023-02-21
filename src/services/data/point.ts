import * as Constants from '../../utils/constants'
import { DisplayUser } from '../../types/user'
import { Game } from '../../types/game'
import Point from '../../types/point'
import { TeamNumber } from '../../types/team'
import { throwApiError } from '../../utils/service-utils'
import { withGameToken } from './game'
import {
    ActionType,
    LiveServerAction,
    SavedServerAction,
} from '../../types/action'
import {
    activeGameId as localActiveGameId,
    activeGameOffline as localActiveGameOffline,
    getGameById as localGetGameById,
    saveGame as localSaveGame,
} from '../local/game'
import {
    createOfflinePoint as localCreateOfflinePoint,
    deletePoint as localDeletePoint,
    getPointById as localGetPointById,
    getPointByPointNumber as localGetPointByPointNumber,
    savePoint as localSavePoint,
} from '../local/point'
import {
    deleteAllActionsByPoint as localDeleteAllActionsByPoint,
    deleteEditableActionsByPoint as localDeleteEditableActionsByPoint,
    getActions as localGetActions,
    getActionsByPoint as localGetActionsByPoint,
    saveActions as localSaveActions,
    saveMultipleServerActions as localSaveMultipleActions,
} from '../local/action'
import {
    createPoint as networkCreatePoint,
    deletePoint as networkDeletePoint,
    finishPoint as networkFinishPoint,
    getActionsByPoint as networkGetActionsByPoint,
    getLiveActionsByPoint as networkGetLiveActionsByPoint,
    reactivatePoint as networkReactivatePoint,
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
            pointId = point._id
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
            await finishOfflinePoint(pointId)
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

const finishOfflinePoint = async (pointId: string) => {
    try {
        const point = await localGetPointById(pointId)
        if (!point.teamOneActive) {
            return
        }
        const actions = await localGetActionsByPoint(pointId)

        for (const a of actions) {
            if (a.actionType === ActionType.TEAM_ONE_SCORE) {
                point.teamOneScore += 1
                break
            } else if (a.actionType === ActionType.TEAM_TWO_SCORE) {
                point.teamTwoScore += 1
                break
            }
        }

        point.teamOneActive = false
        await localSavePoint(point)
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
    team: TeamNumber,
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

/**
 * Method to reactivate a point
 * @param pointId id of point
 * @param team team one or two
 * @returns updated point
 */
export const reactivatePoint = async (
    previousId: string,
    pointNumber: number,
    team: TeamNumber,
): Promise<Point> => {
    try {
        const gameId = await localActiveGameId()
        const game = await localGetGameById(gameId)
        // find point by point number
        const point = await localGetPointByPointNumber(pointNumber, game.points)
        if (!point) {
            throw new Error()
        }
        if (game.offline) {
            game.points = game.points.filter(id => id !== previousId)
            if (pointNumber === 1) {
                point.teamOneScore = 0
                point.teamTwoScore = 0
                game.teamOneScore = 0
                game.teamTwoScore = 0
            } else {
                const prevPoint = await localGetPointByPointNumber(
                    pointNumber - 1,
                    game.points,
                )
                if (!prevPoint) {
                    throw new Error()
                }

                point.teamOneScore = prevPoint.teamOneScore
                point.teamTwoScore = prevPoint.teamTwoScore
                game.teamOneScore = prevPoint.teamOneScore
                game.teamTwoScore = prevPoint.teamTwoScore
            }
            // currently, games can only be offline on creation
            // therefore only team one will be active
            point.teamOneActive = true
            await localDeletePoint(previousId)
            await localSavePoint(point)
            await localSaveGame(game)
        } else {
            // reactivate point on backend
            await withGameToken(networkDeletePoint, previousId)
            const pointResponse = await withGameToken(
                networkReactivatePoint,
                point._id,
            )
            const { point: responsePoint } = pointResponse.data

            // load actions from backend
            const actionsResponse = await networkGetLiveActionsByPoint(
                game._id,
                point._id,
            )

            const { actions: networkActions } = actionsResponse.data
            await localDeleteEditableActionsByPoint(team, point._id)
            await localSaveMultipleActions(
                networkActions.map((action: SavedServerAction) => {
                    return { ...action, teamNumber: team }
                }),
                point._id,
            )
            const newActions = await localGetActionsByPoint(responsePoint._id)
            if (team === 'one') {
                responsePoint.teamOneActions = newActions.map(
                    action => action._id,
                )
            } else {
                responsePoint.teamTwoActions = newActions.map(
                    action => action._id,
                )
            }

            await localSavePoint(responsePoint)
        }

        const response = await localGetPointById(point._id)
        return response
    } catch (e) {
        return throwApiError(e, Constants.GET_POINT_ERROR)
    }
}
