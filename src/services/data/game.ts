import * as Constants from '../../utils/constants'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import { CreateGame, Game } from '../../types/game'
import {
    createGame as networkCreateGame,
    searchGames as networkSearchGames,
} from '../network/game'

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

export const createGame = async (data: CreateGame): Promise<Game> => {
    try {
        const response = await withToken(networkCreateGame, data)

        const { game } = response.data
        return game
    } catch (e) {
        return throwApiError(e, Constants.CREATE_GAME_ERROR)
    }
}
