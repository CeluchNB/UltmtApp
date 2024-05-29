import * as Constants from '../../utils/constants'
import { DisplayUser } from '../../types/user'
import { Game } from '../../types/game'
import { PointSchema } from '../../models'
import { TeamNumber } from '../../types/team'
import { generatePlayerStatsForPoint } from '../../utils/in-game-stats'
import { throwApiError } from '../../utils/service-utils'
import { withGameToken } from './game'
import {
    Action,
    ActionFactory,
    ActionType,
    LiveServerActionData,
    SavedServerActionData,
} from '../../types/action'
import Point, { PointStatus } from '../../types/point'
import {
    createOfflinePoint as localCreateOfflinePoint,
    deletePoint as localDeletePoint,
    getPointById as localGetPointById,
    getPointByPointNumber as localGetPointByPointNumber,
    savePoint as localSavePoint,
} from '../local/point'
import {
    deleteAllDisplayActionsByPoint as localDeleteAllActionsByPoint,
    deleteEditableActionsByPoint as localDeleteEditableActionsByPoint,
    getActionsByPoint as localGetActionsByPoint,
    getDisplayActions as localGetDisplayActions,
    saveDisplayActions as localSaveDisplayActions,
    saveMultipleServerActions as localSaveMultipleActions,
} from '../local/action'
import {
    getActiveGameId as localGetActiveGameId,
    isActiveGameOffline as localGetActiveGameOffline,
    getGameById as localGetGameById,
    saveGame as localSaveGame,
} from '../local/game'
import {
    createPoint as networkCreatePoint,
    deletePoint as networkDeletePoint,
    finishPoint as networkFinishPoint,
    getActionsByPoint as networkGetActionsByPoint,
    getLiveActionsByPoint as networkGetLiveActionsByPoint,
    reactivatePoint as networkReactivatePoint,
    setPlayers as networkSetPlayers,
    setPullingTeam as networkSetPullingTeam,
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
        const offline = await localGetActiveGameOffline()
        const gameId = await localGetActiveGameId()
        const game = await localGetGameById(gameId)
        let pointId: string = ''
        if (offline) {
            pointId = await createOfflinePoint(pulling, pointNumber, game)
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

        // await addPointToGame(gameId, pointId)
        const result = await localGetPointById(pointId)
        return result
    } catch (e: any) {
        return throwApiError(e, Constants.CREATE_POINT_ERROR)
    }
}

const createOfflinePoint = async (
    pulling: boolean,
    pointNumber: number,
    game: Game,
): Promise<string> => {
    const pointId = await localCreateOfflinePoint(pulling, pointNumber, game)
    return pointId
}

/**
 * Method to finish a point. In the backend this moves actions out of redis and to mongo.
 * @param pointId id of point to finish
 * @returns updated point
 */
export const finishPoint = async (
    point: PointSchema,
    actions: LiveServerActionData[],
    team: TeamNumber,
): Promise<Point> => {
    try {
        const pointId = point._id
        const offline = await localGetActiveGameOffline()
        if (offline) {
            await finishOfflinePoint(pointId)
        } else {
            const response = await withGameToken(networkFinishPoint, pointId)
            const { point: responsePoint } = response.data
            await localSavePoint(responsePoint)
        }

        const result = await localGetPointById(pointId)
        await updateGameScore(result.teamOneScore, result.teamTwoScore)
        await addInGamePlayerStats(point, actions, team)
        return result
    } catch (e: any) {
        return throwApiError(e, Constants.FINISH_POINT_ERROR)
    }
}

const updateGameScore = async (teamOneScore: number, teamTwoScore: number) => {
    const gameId = await localGetActiveGameId()
    const game = await localGetGameById(gameId)
    await localSaveGame({ ...game, teamOneScore, teamTwoScore })
}

const addInGamePlayerStats = async (
    point: PointSchema,
    actions: LiveServerActionData[],
    team: TeamNumber,
) => {
    const gameId = await localGetActiveGameId()
    const game = await localGetGameById(gameId)

    const players = team === 'one' ? point.teamOnePlayers : point.teamTwoPlayers
    const pointStats = generatePlayerStatsForPoint(players, actions)

    const stats = [
        ...game.statsPoints,
        { _id: point._id, pointStats: pointStats },
    ]
    await localSaveGame({ ...game }, stats)
}

const removeInGamePlayerStats = async (pointId: string) => {
    const gameId = await localGetActiveGameId()
    const game = await localGetGameById(gameId)

    game.statsPoints = game.statsPoints.filter(point => {
        return point._id !== pointId
    })

    await localSaveGame({ ...game }, game.statsPoints)
}

const finishOfflinePoint = async (pointId: string) => {
    try {
        const point = await localGetPointById(pointId)
        if (point.teamOneStatus !== PointStatus.ACTIVE) {
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

        point.teamOneStatus = PointStatus.COMPLETE
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

/**
 * Method to reactivate a point. Reactivation of a point can only occur if it is the last
 * existing point in a game.
 * @param pointId id of point
 * @param team team one or two
 * @returns updated point
 */
// TODO: GAME-REFACTOR
export const reactivatePoint = async (
    deleteId: string,
    pointNumber: number,
    team: TeamNumber,
): Promise<Point> => {
    throw new Error('Not implemented yet')
    // return await localGetPointByPointNumber(pointNumber, ['abc'])
    // try {
    //     let currentPointId
    //     const gameId = await localGetActiveGameId()
    //     const game = await localGetGameById(gameId)
    //     // find point by point number
    //     const point = await localGetPointByPointNumber(pointNumber, game.points)
    //     if (!point) {
    //         throw new Error()
    //     }
    //     if (game.offline) {
    //         game.points = game.points.filter(id => id !== deleteId)
    //         if (pointNumber === 1) {
    //             point.teamOneScore = 0
    //             point.teamTwoScore = 0
    //             game.teamOneScore = 0
    //             game.teamTwoScore = 0
    //         } else {
    //             const prevPoint = await localGetPointByPointNumber(
    //                 pointNumber - 1,
    //                 game.points,
    //             )
    //             currentPointId = prevPoint?._id ?? ''
    //             if (!prevPoint) {
    //                 throw new Error()
    //             }
    //             point.teamOneScore = prevPoint.teamOneScore
    //             point.teamTwoScore = prevPoint.teamTwoScore
    //             game.teamOneScore = prevPoint.teamOneScore
    //             game.teamTwoScore = prevPoint.teamTwoScore
    //         }
    //         // currently, games can only be offline on creation
    //         // therefore only team one will be active
    //         point.teamOneActive = true
    //         await localDeletePoint(deleteId)
    //         await localSavePoint(point)
    //         await localSaveGame(game)
    //     } else {
    //         // reactivate point on backend
    //         await withGameToken(networkDeletePoint, deleteId)
    //         const pointResponse = await withGameToken(
    //             networkReactivatePoint,
    //             point._id,
    //         )
    //         const { point: responsePoint } = pointResponse.data
    //         currentPointId = responsePoint._id
    //         // load actions from backend
    //         const actionsResponse = await networkGetLiveActionsByPoint(
    //             game._id,
    //             point._id,
    //         )
    //         const { actions: networkActions } = actionsResponse.data
    //         await localDeleteEditableActionsByPoint(team, point._id)
    //         await localSaveMultipleActions(
    //             networkActions.map((action: SavedServerActionData) => {
    //                 return { ...action, teamNumber: team }
    //             }),
    //             point._id,
    //         )
    //         const newActions = await localGetActionsByPoint(responsePoint._id)
    //         if (team === 'one') {
    //             responsePoint.teamOneActions = newActions.map(
    //                 action => action._id,
    //             )
    //         } else {
    //             responsePoint.teamTwoActions = newActions.map(
    //                 action => action._id,
    //             )
    //         }
    //         await localDeletePoint(deleteId)
    //         await localSavePoint(responsePoint)
    //         await updateGameScore(
    //             responsePoint.teamOneScore,
    //             responsePoint.teamTwoScore,
    //         )
    //     }
    //     await removeInGamePlayerStats(currentPointId)
    //     const response = await localGetPointById(point._id)
    //     return response
    // } catch (e) {
    //     return throwApiError(e, Constants.GET_POINT_ERROR)
    // }
}

/**
 * Update which team is pulling
 * @param pointId id of point to update
 * @param team team number of pulling team
 * @returns updated point
 */
export const setPullingTeam = async (
    pointId: string,
    team: TeamNumber,
): Promise<Point> => {
    try {
        const offline = await localGetActiveGameOffline()
        if (offline) {
            return await updateLocalPoint(pointId, team)
        } else {
            const response = await withGameToken(
                networkSetPullingTeam,
                pointId,
                team,
            )

            const { point } = response.data
            await localSavePoint(point)

            const localPoint = await localGetPointById(point._id)
            return localPoint
        }
    } catch (error) {
        return throwApiError(error, Constants.MODIFY_LIVE_POINT_ERROR)
    }
}

const updateLocalPoint = async (
    pointId: string,
    team: TeamNumber,
): Promise<Point> => {
    const activeGameId = await localGetActiveGameId()
    const game = await localGetGameById(activeGameId)

    const point = await localGetPointById(pointId)

    if (team === 'one') {
        point.pullingTeam = game.teamOne
        point.receivingTeam = game.teamTwo
    } else {
        point.pullingTeam = game.teamTwo
        point.receivingTeam = game.teamOne
    }

    await localSavePoint(point)
    const localPoint = await localGetPointById(point._id)
    return localPoint
}
