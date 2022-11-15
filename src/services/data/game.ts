import * as Constants from '../../utils/constants'
import { AxiosResponse } from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'
import { GuestUser } from '../../types/user'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import { CreateGame, Game } from '../../types/game'
import {
    addGuestPlayer as networkAddGuestPlayer,
    createGame as networkCreateGame,
    searchGames as networkSearchGames,
} from '../network/game'

/**
 * Method to search games with available search and query parameters.
 * @param q search query
 * @param live filter by live games (true = returns live games, false = returns completed games, undefined = both)
 * @param after date the game occurred after
 * @param before date the game occurred before
 * @param pageSize amount of results to return
 * @param offset amount of results to skip
 * @returns list of games
 */
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

/**
 * Method to create a game
 * @param data all necessary data to create a game
 * @returns the created game
 */
export const createGame = async (data: CreateGame): Promise<Game> => {
    try {
        const response = await withToken(networkCreateGame, data)

        const { game, token } = response.data
        await EncryptedStorage.setItem('game_token', token)
        return game
    } catch (e) {
        return throwApiError(e, Constants.CREATE_GAME_ERROR)
    }
}

/**
 * Method to add a guest player to a specific team for one game
 * @param player guest player to add to a team for a game
 * @returns updated game
 */
export const addGuestPlayer = async (player: GuestUser): Promise<Game> => {
    try {
        const response = await withGameToken(networkAddGuestPlayer, player)
        const { game } = response.data
        return game
    } catch (e) {
        return throwApiError(e, Constants.ADD_GUEST_ERROR)
    }
}

export const withGameToken = async (
    networkCall: (gameToken: string, ...args: any) => Promise<AxiosResponse>,
    ...args: any
) => {
    const token = (await EncryptedStorage.getItem('game_token')) || ''
    return await networkCall(token, ...args)
}
