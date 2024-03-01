import * as Constants from '../../utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AxiosResponse } from 'axios'
import EncryptedStorage from 'react-native-encrypted-storage'
import { LocalUser } from '../../types/team'
import { closeRealm } from '../../models/realm'
import { createGuestPlayer } from '../../utils/realm'
import { createPlayerSet } from '../../utils/player'
import dayjs from 'dayjs'
import { getUserId } from './user'
import { createGuest as networkCreateGuest } from '../network/team'
import { parseClientAction } from '../../utils/action'
import { parseClientPoint } from '../../utils/point'
import { parseFullGame } from '../../utils/game'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import { CreateGame, Game, UpdateGame } from '../../types/game'
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
    deleteEditableActionsByPoint as localDeleteActions,
    getActionsByPoint as localGetActionsByPoint,
    saveMultipleServerActions as localSaveMultipleServerActions,
} from '../local/action'
import {
    getPointById as localGetPointById,
    getPointByPointNumber as localGetPointByPointNumber,
    savePoint as localSavePoint,
} from '../local/point'
import {
    getTeamById as localGetTeamById,
    saveTeams as localSaveTeams,
} from '../local/team'
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
    logGameOpen as networkLogGameOpen,
    pushOfflineGame as networkPushOfflineGame,
    reactivateGame as networkReactivateGame,
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
 * Method to reactivate a game that is not currently live.
 * @param gameId id of game to reactivate
 * @param teamId id of team to reactivate from
 * @returns object with data: { game, team, active point, has active actions }
 */
export const reactivateGame = async (gameId: string, teamId: string) => {
    // look for game locally
    const localGame = await getLocalGameIfExists(gameId)

    if (localGame?.offline) {
        return await reactivateOfflineGame(localGame)
    } else {
        return await reactivateOnlineGame(gameId, teamId)
    }
}

const getLocalGameIfExists = async (
    gameId: string,
): Promise<(Game & { offline: boolean }) | undefined> => {
    try {
        return await localGetGameById(gameId)
    } catch (e) {
        return undefined
    }
}

const reactivateOfflineGame = async (game: Game & { offline: boolean }) => {
    game.teamOneActive = true
    await activateGameLocally(game)

    // get the active point
    let activePoint
    try {
        activePoint = await localGetPointByPointNumber(
            game.points.length,
            game.points,
        )
    } catch (e) {
        activePoint = undefined
    }

    // get actions on active point
    const actions = []
    if (activePoint) {
        actions.push(...(await localGetActionsByPoint(activePoint._id)))
    }

    return {
        activePoint,
        game,
        team: 'one',
        hasActiveActions: actions.length > 0,
    }
}

const reactivateOnlineGame = async (gameId: string, teamId: string) => {
    // reactivate backend game
    const gameResponse = await withToken(networkReactivateGame, gameId, teamId)
    const { game, team, token, activePoint, actions } = gameResponse.data

    await activateGameLocally({ ...game, offline: false })
    await EncryptedStorage.setItem('game_token', token)

    const gameResult = await localGetGameById(gameId)

    if (activePoint) {
        await localSavePoint(activePoint)
        await localDeleteActions(team, activePoint._id)
        await localSaveMultipleServerActions(actions, activePoint._id)
    } else {
        return {
            game: gameResult,
            team,
            activePoint: undefined,
            hasActiveActions: false,
        }
    }

    const point = await localGetPointById(activePoint._id)

    return {
        game: gameResult,
        team,
        activePoint: point,
        hasActiveActions: actions.length > 0,
    }
}

const activateGameLocally = async (game: Game & { offline: boolean }) => {
    await localSaveGame(game)
    await localSetActiveGameId(game._id)
    await localSetActiveGameOffline(game.offline)
}

/**
 * Method to push a game created offline and stored locally to the backend.
 * @param gameId id of locally stored game
 */
export const pushOfflineGame = async (gameId: string): Promise<void> => {
    try {
        // create game data
        const game = await localGetGameById(gameId)

        // create guests
        // guest map is used to reconcile guest players who are created in the backend
        // with different IDs than how they are stored locally
        const guestMap = new Map<string, DisplayUser>()
        const team = await localGetTeamById(game.teamOne._id)
        console.log('after local get team')
        for (const player of team.players) {
            console.log('in loop')
            if ((player as LocalUser).localGuest) {
                console.timeLog('got local guest')
                const response = await withToken(networkCreateGuest, team._id, {
                    _id: player._id,
                    firstName: player.firstName,
                    lastName: player.lastName,
                    username: player.username,
                })
                console.log('after create guest')
                const { team: updatedTeam } = response.data
                const newPlayers = createPlayerSet(
                    updatedTeam.players.map((p: DisplayUser) => ({
                        ...p,
                        localGuest: false,
                    })),
                    team.players,
                )
                await localSaveTeams(
                    [{ ...updatedTeam, players: newPlayers }],
                    true,
                )
                console.log('after save')

                if (
                    !updatedTeam.players
                        .map((p: DisplayUser) => p._id)
                        .includes(player._id) &&
                    updatedTeam.players[updatedTeam.players.length - 1]._id !==
                        player._id
                ) {
                    guestMap.set(
                        player._id,
                        updatedTeam[updatedTeam.players.length - 1],
                    )
                }
            }
        }

        const localPoints = await Promise.all(
            game.points.map(id => {
                return localGetPointById(id)
            }),
        )

        const guestIds = Array.from(guestMap.keys())
        const points: ClientPoint[] = []
        localPoints.forEach(async point => {
            const actions = await localGetActionsByPoint(point._id)
            const clientPoint = parseClientPoint(point)
            clientPoint.actions = actions.map(action => {
                if (
                    action.playerOne &&
                    guestIds.includes(action.playerOne._id)
                ) {
                    action.playerOne = guestMap.get(action.playerOne._id)
                } else if (
                    action.playerTwo &&
                    guestIds.includes(action.playerTwo._id)
                ) {
                    action.playerTwo = guestMap.get(action.playerTwo._id)
                }

                return parseClientAction(action)
            })
            points.push(clientPoint)
        })

        const updatedTeam = await localGetTeamById(game.teamOne._id)
        game.teamOnePlayers = updatedTeam.players
        const fullGame = parseFullGame(game)
        fullGame.points = points

        await withToken(networkPushOfflineGame, fullGame)

        // delete local game
        await localDeleteFullGame(gameId)

        return
    } catch (e) {
        console.log('got e', e)
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
