import * as Constants from '../../utils/constants'
import { Game } from '../../types/game'
import { searchGames as networkSearchGames } from '../network/game'
import { throwApiError } from '../../utils/service-utils'

export const searchGames = async (
    q?: string,
    live?: boolean,
    after?: string,
    before?: string,
    pageSize?: number,
    offset?: number,
): Promise<Game[]> => {
    try {
        const response = await networkSearchGames(
            q,
            live,
            after,
            before,
            pageSize,
            offset,
        )

        const { games } = response.data

        return games
    } catch (e) {
        return throwApiError(e, Constants.SEARCH_ERROR)
    }
}
