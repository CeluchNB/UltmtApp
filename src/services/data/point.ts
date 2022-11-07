import * as Constants from '../../utils/constants'
import Point from '../../types/point'
import { createPoint as networkCreatePoint } from '../network/point'
import { throwApiError } from '../../utils/service-utils'
import { withGameToken } from './game'

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
