import * as Constants from '../../utils/constants'
import { AxiosResponse } from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'
import { GuestUser } from '../../types/user'
import Point from '../../types/point'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import { CreateGame, Game } from '../../types/game'
import {
    activeGames as localActiveGames,
    deleteFullGame as localDeleteFullGame,
    getGameById as localGetGameById,
    saveGame as localSaveGame,
} from '../local/game'
import {
    addGuestPlayer as networkAddGuestPlayer,
    createGame as networkCreateGame,
    finishGame as networkFinishGame,
    getGameById as networkGetGameById,
    getGamesByTeam as networkGetGameByTeams,
    getPointsByGame as networkGetPointsByGame,
    joinGame as networkJoinGame,
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
        await localSaveGame(game)
        await EncryptedStorage.setItem('game_token', token)
        const result = await localGetGameById(game._id)
        return result
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
        await localSaveGame(game)
        const result = await localGetGameById(game._id)
        return result
    } catch (e) {
        return throwApiError(e, Constants.ADD_GUEST_ERROR)
    }
}

/**
 * Method to get a list of points belonging to a specific game
 * @param gameId id of game to get points for
 * @returns list of points
 */
export const getPointsByGame = async (gameId: string): Promise<Point[]> => {
    try {
        const response = await networkGetPointsByGame(gameId)
        const { points } = response.data
        return points
    } catch (e) {
        return throwApiError(e, Constants.GET_GAME_ERROR)
    }
}

/**
 * Method to get a game by id
 * @param gameId id of game to get
 * @returns game object
 */
export const getGameById = async (gameId: string): Promise<Game> => {
    try {
        const response = await networkGetGameById(gameId)
        const { game } = response.data
        return game
    } catch (e) {
        return throwApiError(e, Constants.GET_GAME_ERROR)
    }
}

/**
 * Method to join a game as the second team.
 * @param gameId id of game to join
 * @param teamId id of joining team
 * @param code join passcode for game
 * @returns game object (and saved game token locally)
 */
export const joinGame = async (
    gameId: string,
    teamId: string,
    code: string,
): Promise<Game> => {
    try {
        const response = await withToken(networkJoinGame, gameId, teamId, code)
        const { game, token } = response.data
        await localSaveGame(game)
        await EncryptedStorage.setItem('game_token', token)
        const result = await localGetGameById(game._id)
        return result
    } catch (e) {
        return throwApiError(e, Constants.JOIN_GAME_ERROR)
    }
}

/**
 * Method to finish a game as a game editor
 * @returns the updated game
 */
export const finishGame = async (): Promise<Game> => {
    try {
        const response = await withGameToken(networkFinishGame)
        const { game } = response.data
        await localDeleteFullGame(game._id)
        return game
    } catch (e) {
        return throwApiError(e, Constants.FINISH_GAME_ERROR)
    }
}

/**
 * Get all games associated with a specific team. (Team ID must be teamOne's or teamTwo's _id)
 * @param teamId id of team
 * @returns list of games associated with team
 */
export const getGamesByTeam = async (teamId: string): Promise<Game[]> => {
    try {
        const response = await networkGetGameByTeams(teamId)
        const { games } = response.data
        return games
    } catch (e) {
        return throwApiError(e, Constants.GET_GAME_ERROR)
    }
}

/**
 * Method to get active games saved locally. These games either
 * need to be finished or pushed to the backend.
 * @returns list of games
 */
export const getActiveGames = async (userId: string): Promise<Game[]> => {
    try {
        const games = await localActiveGames(userId)
        return games
    } catch (e) {
        return throwApiError(e, Constants.GET_GAME_ERROR)
    }
}

export const withGameToken = async (
    networkCall: (gameToken: string, ...args: any) => Promise<AxiosResponse>,
    ...args: any
) => {
    const token = (await EncryptedStorage.getItem('game_token')) || ''
    return await networkCall(token, ...args)
}
