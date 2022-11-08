import * as Constants from '../../utils/constants'
import { GuestUser } from '../../types/user'
import Point from '../../types/point'
import { throwApiError } from '../../utils/service-utils'
import { withGameToken } from './game'
import {
    createPoint as networkCreatePoint,
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
