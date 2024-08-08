import * as Constants from '../../utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AxiosResponse } from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'
import { Game } from '../../types/game'
import Point from '../../types/point'
import dayjs from 'dayjs'
import { getUserId } from './user'
import { throwApiError } from '../../utils/service-utils'
import {
    getActiveGames as localActiveGames,
    getGameById as localGetGameById,
} from '../local/game'
import {
    getGameById as networkGetGameById,
    getGamesByTeam as networkGetGameByTeams,
    getPointsByGame as networkGetPointsByGame,
    logGameOpen as networkLogGameOpen,
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
 * Method to get a list of points belonging to a specific game
 * @param gameId id of game to get points for
 * @returns list of points
 */
export const getPointsByGame = async (gameId: string): Promise<Point[]> => {
    try {
        const response = await networkGetPointsByGame(gameId)
        const { points } = response.data
        return points.sort(
            (a: Point, b: Point) => b.pointNumber - a.pointNumber,
        )
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
 * Method to get an offline game by it's id
 * @param gameId game id
 * @returns game
 */
export const getOfflineGameById = async (
    gameId: string,
): Promise<Game & { offline: boolean }> => {
    try {
        return await localGetGameById(gameId)
    } catch (e) {
        return throwApiError(e, Constants.GET_GAME_ERROR)
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
export const getActiveGames = async (): Promise<
    (Game & { offline: boolean })[]
> => {
    try {
        const userId = await getUserId()
        const games = await localActiveGames(userId)
        return games
    } catch (e) {
        return throwApiError(e, Constants.GET_GAME_ERROR)
    }
}

/**
 * Method to log a view by the game
 * @param gameId id of game that is viewed
 * @returns updated game
 */
export const logGameOpen = async (
    gameId: string,
): Promise<Game | undefined> => {
    try {
        const lastViewedDate = await AsyncStorage.getItem(`game:view:${gameId}`)

        await AsyncStorage.setItem(`game:view:${gameId}`, dayjs().toString())
        if (
            lastViewedDate &&
            dayjs(lastViewedDate).isAfter(dayjs().subtract(1, 'day'))
        ) {
            return
        }

        const response = await networkLogGameOpen(gameId)
        const { game } = response.data

        return game
    } catch (e) {
        return throwApiError(e, Constants.GET_GAME_ERROR)
    }
}

export const deleteExpiredGameViews = async () => {
    const allKeys = await AsyncStorage.getAllKeys()
    for (const key of allKeys) {
        if (key.match(/game:view:/)) {
            const expiryDate = await AsyncStorage.getItem(key)
            if (
                dayjs(expiryDate).isValid() &&
                dayjs(expiryDate).isBefore(dayjs().subtract(1, 'day'))
            ) {
                await AsyncStorage.removeItem(key)
            }
        }
    }
}

export const withGameToken = async (
    networkCall: (gameToken: string, ...args: any) => Promise<AxiosResponse>,
    ...args: any
) => {
    const token = (await EncryptedStorage.getItem('game_token')) || ''
    return await networkCall(token, ...args)
}

// TODO: Store multiple game tokens? By Id?
export const getGameToken = async (): Promise<string | null> => {
    const token = await EncryptedStorage.getItem('game_token')
    return token
}
