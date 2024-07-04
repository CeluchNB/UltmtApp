import * as Constants from '../../utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AxiosResponse } from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'
import Point from '../../types/point'
import { createGuestPlayer } from '../../utils/realm'
import dayjs from 'dayjs'
import { getUserId } from './user'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import { CreateGame, Game, UpdateGame } from '../../types/game'
import { DisplayUser, GuestUser } from '../../types/user'
import {
    getActiveGameId as localActiveGameId,
    isActiveGameOffline as localActiveGameOffline,
    getActiveGames as localActiveGames,
    getGameById as localGetGameById,
    saveGame as localSaveGame,
    setActiveGameId as localSetActiveGameId,
    setActiveGameOffline as localSetActiveGameOffline,
} from '../local/game'
import {
    addGuestPlayer as networkAddGuestPlayer,
    createGame as networkCreateGame,
    deleteGame as networkDeleteGame,
    editGame as networkEditGame,
    getGameById as networkGetGameById,
    getGamesByTeam as networkGetGameByTeams,
    getPointsByGame as networkGetPointsByGame,
    joinGame as networkJoinGame,
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
 * Method to create a game
 * @param data all necessary data to create a game
 * @returns the created game
 */
export const createGame = async (
    data: CreateGame,
    offline: boolean,
    teamOnePlayers: DisplayUser[],
): Promise<Game> => {
    try {
        let id: string
        if (offline) {
            const userId = await getUserId()
            data.creator._id = userId
            // id = await localCreateOfflineGame(data, teamOnePlayers)
        } else {
            const response = await withToken(networkCreateGame, data)
            const { game, token } = response.data
            id = game._id
            await localSaveGame(game)
            await EncryptedStorage.setItem('game_token', token)
        }
        // await localSetActiveGameId(id)
        await localSetActiveGameOffline(offline)
        const result = await localGetGameById('')
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
        const offline = await localActiveGameOffline()
        const gameId = await localActiveGameId()
        if (offline) {
            const game = await localGetGameById(gameId)
            const guest = createGuestPlayer(player)
            await localSaveGame({
                ...game,
                teamOnePlayers: [...game.teamOnePlayers, guest],
            })
        } else {
            const response = await withGameToken(networkAddGuestPlayer, player)
            const { game } = response.data
            await localSaveGame(game)
        }
        const result = await localGetGameById(gameId)
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
        await localSetActiveGameId(gameId)
        await localSetActiveGameOffline(false)
        const result = await localGetGameById(game._id)
        return result
    } catch (e) {
        return throwApiError(e, Constants.JOIN_GAME_ERROR)
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
 * Method to determine if currently active game is offline
 * @returns boolean indicating current game is offline or not
 */
export const activeGameOffline = async (): Promise<boolean> => {
    return await localActiveGameOffline()
}

/**
 * Method to delete a game.
 * @param gameId id of game to delete
 * @param teamId id of team deleting
 */
export const deleteGame = async (gameId: string, teamId: string) => {
    try {
        try {
            // await localDeleteFullGame(gameId)
        } finally {
            await withToken(networkDeleteGame, gameId, teamId)
        }
    } catch (e) {
        return throwApiError(e, Constants.DELETE_GAME_ERROR)
    }
}

/**
 * Method to edit a game.
 * @param gameId id of game
 * @param data updated game data
 * @returns updated game
 */
export const editGame = async (
    gameId: string,
    data: UpdateGame,
): Promise<Game> => {
    try {
        const game = await localGetGameById(gameId)
        if (!game.offline) {
            const response = await withGameToken(networkEditGame, data)
            const { game: responseGame } = response.data
            await localSaveGame(responseGame)
        } else {
            await localSaveGame({ ...game, ...data })
        }

        return await localGetGameById(gameId)
    } catch (e) {
        return throwApiError(e, Constants.UPDATE_GAME_ERROR)
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
