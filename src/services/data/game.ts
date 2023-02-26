import * as Constants from '../../utils/constants'
import { AxiosResponse } from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'
import { SavedServerActionData } from '../../types/action'
import { closeRealm } from '../../models/realm'
import { createGuestPlayer } from '../../utils/realm'
import { parseClientAction } from '../../utils/action'
import { parseClientPoint } from '../../utils/point'
import { parseFullGame } from '../../utils/game'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import { CreateGame, Game, LocalGame, UpdateGame } from '../../types/game'
import { DisplayUser, GuestUser } from '../../types/user'
import Point, { ClientPoint } from '../../types/point'
import {
    getActiveGameId as localActiveGameId,
    isActiveGameOffline as localActiveGameOffline,
    getActiveGames as localActiveGames,
    createOfflineGame as localCreateOfflineGame,
    deleteFullGame as localDeleteFullGame,
    getGameById as localGetGameById,
    saveGame as localSaveGame,
    setActiveGameId as localSetActiveGameId,
    setActiveGameOffline as localSetActiveGameOffline,
} from '../local/game'
import {
    getActionsByPoint as localGetActionsByPoint,
    saveMultipleServerActions as localSaveMultipleServerActions,
} from '../local/action'
import {
    getPointById as localGetPointById,
    savePoint as localSavePoint,
} from '../local/point'
import {
    addGuestPlayer as networkAddGuestPlayer,
    createGame as networkCreateGame,
    deleteGame as networkDeleteGame,
    editGame as networkEditGame,
    finishGame as networkFinishGame,
    getGameById as networkGetGameById,
    getGamesByTeam as networkGetGameByTeams,
    getPointsByGame as networkGetPointsByGame,
    joinGame as networkJoinGame,
    pushOfflineGame as networkPushOfflineGame,
    reactivateGame as networkReactivateGame,
    searchGames as networkSearchGames,
} from '../network/game'
import {
    getActionsByPoint as networkGetActionsByPoint,
    reactivatePoint as networkReactivatePoint,
} from '../network/point'

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
            id = await localCreateOfflineGame(data, teamOnePlayers)
        } else {
            const response = await withToken(networkCreateGame, data)
            const { game, token } = response.data
            id = game._id
            await localSaveGame(game)
            await EncryptedStorage.setItem('game_token', token)
        }
        await localSetActiveGameId(id)
        await localSetActiveGameOffline(offline)
        const result = await localGetGameById(id)
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
 * Method to finish a game as a game editor
 * @returns the updated game
 */
export const finishGame = async (): Promise<Game> => {
    try {
        const offline = await localActiveGameOffline()
        if (offline) {
            const gameId = await localActiveGameId()
            const game = await localGetGameById(gameId)
            game.teamOneActive = false
            await localSaveGame(game)
            closeRealm()
            return game
        } else {
            const response = await withGameToken(networkFinishGame)
            const { game } = response.data

            await localDeleteFullGame(game._id)
            closeRealm()
            return game
        }
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
export const getActiveGames = async (
    userId: string,
): Promise<(Game & { offline: boolean })[]> => {
    try {
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
 * Method to do all necessary data operations to reactivate a game that is
 * still live and stored on a user's device.
 * @param gameId id of game
 * @returns game
 */
export const resurrectActiveGame = async (
    gameId: string,
    teamId: string,
): Promise<LocalGame> => {
    try {
        const localGame = await localGetGameById(gameId)
        if (localGame.offline) {
            localGame.teamOneActive = true
            await localSaveGame(localGame)
        } else {
            const response = await withToken(
                networkReactivateGame,
                gameId,
                teamId,
            )
            const { game, token } = response.data
            await localSaveGame(game)
            await EncryptedStorage.setItem('game_token', token)
        }
        const result = await localGetGameById(localGame._id)
        await localSetActiveGameId(localGame._id)
        await localSetActiveGameOffline(localGame.offline)

        return result
    } catch (e) {
        return throwApiError(e, Constants.GET_GAME_ERROR)
    }
}

/**
 * Reactivate a game that has been finished and pushed to the backend.
 * @param gameId id of game to reactivate
 * @param teamId
 * @returns game object
 */
export const reactivateInactiveGame = async (
    gameId: string,
    teamId: string,
): Promise<Game & { offline: boolean }> => {
    try {
        // call reactivate game
        const gameResponse = await withToken(
            networkReactivateGame,
            gameId,
            teamId,
        )
        // save game
        const { game, token } = gameResponse.data
        await localSaveGame(game)
        await EncryptedStorage.setItem('game_token', token)
        await localSetActiveGameId(game._id)
        await localSetActiveGameOffline(false)

        // get points
        const pointResponse = await networkGetPointsByGame(gameId)
        const { points } = pointResponse.data
        // save points locally
        await Promise.all(points.map((point: Point) => localSavePoint(point)))

        const team = game.teamOne._id === teamId ? 'one' : 'two'
        // get actions
        let activePoint: Point | undefined
        for (const point of points) {
            if (!activePoint || activePoint.pointNumber < point.pointNumber) {
                activePoint = point
            }

            const actionResponse = await networkGetActionsByPoint(
                team,
                point._id,
            )
            const { actions: networkActions } = actionResponse.data

            // save actions locally
            await localSaveMultipleServerActions(
                networkActions.map((action: SavedServerActionData) => {
                    return { ...action, teamNumber: team }
                }),
                point._id,
            )
        }
        await withGameToken(networkReactivatePoint, activePoint?._id)

        const result = await localGetGameById(game._id)
        return result
    } catch (e) {
        return throwApiError(e, Constants.GET_GAME_ERROR)
    }
}

/**
 * Method to push a game created offline and stored locally to the backend.
 * @param gameId id of locally stored game
 */
export const pushOfflineGame = async (gameId: string): Promise<void> => {
    try {
        // create game data
        const game = await localGetGameById(gameId)
        const localPoints = await Promise.all(
            game.points.map(id => {
                return localGetPointById(id)
            }),
        )

        const points: ClientPoint[] = []
        localPoints.forEach(async point => {
            const actions = await localGetActionsByPoint(point._id)
            const clientPoint = parseClientPoint(point)
            clientPoint.actions = actions.map(action =>
                parseClientAction(action),
            )
            points.push(clientPoint)
        })

        const fullGame = parseFullGame(game)
        fullGame.points = points

        await withToken(networkPushOfflineGame, fullGame)

        // delete local game
        await localDeleteFullGame(gameId)

        return
    } catch (e) {
        return throwApiError(e, Constants.FINISH_GAME_ERROR)
    }
}

/**
 * Method to delete a game.
 * @param gameId id of game to delete
 * @param teamId id of team deleting
 */
export const deleteGame = async (gameId: string, teamId: string) => {
    try {
        try {
            await localDeleteFullGame(gameId)
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

export const withGameToken = async (
    networkCall: (gameToken: string, ...args: any) => Promise<AxiosResponse>,
    ...args: any
) => {
    const token = (await EncryptedStorage.getItem('game_token')) || ''
    return await networkCall(token, ...args)
}
