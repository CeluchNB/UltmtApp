import * as Constants from '../../utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DisplayUser } from '../../types/user'
import { Realm } from '@realm/react'
import { getRealm } from '../../models/realm'
import { throwApiError } from '../../utils/service-utils'
import { ActionSchema, GameSchema, PointSchema } from '../../models'
import { CreateGame, Game, PointStats } from '../../types/game'

const parseGame = (
    schema: GameSchema,
): Game & { offline: boolean; statsPoints: PointStats[] } => {
    return JSON.parse(
        JSON.stringify({
            _id: schema._id,
            creator: schema.creator,
            teamOne: schema.teamOne,
            teamTwo: schema.teamTwo,
            teamTwoDefined: schema.teamTwoDefined,
            scoreLimit: schema.scoreLimit,
            halfScore: schema.halfScore,
            startTime: schema.startTime,
            softcapMins: schema.softcapMins,
            hardcapMins: schema.hardcapMins,
            playersPerPoint: schema.playersPerPoint,
            timeoutPerHalf: schema.timeoutPerHalf,
            floaterTimeout: schema.floaterTimeout,
            tournament: schema.tournament,
            teamOneScore: schema.teamOneScore,
            teamTwoScore: schema.teamTwoScore,
            teamOnePlayers: schema.teamOnePlayers,
            teamTwoPlayers: schema.teamTwoPlayers,
            resolveCode: schema.resolveCode,
            statsPoints: schema.statsPoints,
            offline: schema.offline,
            teamOneStatus: schema.teamOneStatus,
            teamTwoStatus: schema.teamTwoStatus,
        }),
    )
}

/**
 * Method to determine if currently active game is offline
 * @returns boolean indicating current game is offline or not
 */
export const isActiveGameOffline = async (): Promise<boolean> => {
    return (await AsyncStorage.getItem('active_game_offline')) === 'true'
}

/**
 * Method to get the ObjectId of the current active game
 * @returns current active game id
 */
export const getActiveGameId = async (): Promise<string> => {
    return (await AsyncStorage.getItem('active_game_id')) || ''
}

/**
 * Method to set active game offline status
 * @param offline boolean
 */
export const setActiveGameOffline = async (offline: boolean) => {
    await AsyncStorage.setItem('active_game_offline', offline.toString())
}

/**
 * Method to set active game id
 * @param id string
 */
export const setActiveGameId = async (id: string) => {
    await AsyncStorage.setItem('active_game_id', id)
}

export const createOfflineGame = async (
    data: CreateGame,
    teamOnePlayers: DisplayUser[],
): Promise<string> => {
    const realm = await getRealm()

    let id: string = ''
    realm.write(() => {
        const game = realm.create<GameSchema>(
            'Game',
            GameSchema.createOfflineGame(data, teamOnePlayers),
            Realm.UpdateMode.All,
        )
        id = game._id
    })

    return id
}

export const saveGame = async (game: Game, stats?: PointStats[]) => {
    const realm = await getRealm()
    const gameRecord = await realm.objectForPrimaryKey<GameSchema>(
        'Game',
        game._id,
    )
    let offline = false
    if (gameRecord) {
        offline = gameRecord.offline
    }
    const newStats = stats ?? gameRecord?.statsPoints ?? []

    const schema = new GameSchema(game, offline, newStats)
    realm.write(() => {
        realm.create('Game', schema, Realm.UpdateMode.Modified)
    })
}

export const getGameById = async (
    gameId: string,
): Promise<Game & { offline: boolean; statsPoints: PointStats[] }> => {
    const realm = await getRealm()
    const game = await realm.objectForPrimaryKey<GameSchema>('Game', gameId)
    if (!game) {
        return throwApiError({}, Constants.GET_GAME_ERROR)
    }
    return parseGame(game)
}

export const getActiveGames = async (
    userId: string,
): Promise<(Game & { offline: boolean })[]> => {
    const realm = await getRealm()
    const games = await realm.objects<GameSchema>('Game')

    return games
        .filter(g => g.creator._id === userId)
        .map(game => parseGame(game))
}

// TODO: GAME-REFACTOR
// export const deleteFullGame = async (gameId: string): Promise<void> => {
//     const realm = await getRealm()
//     const game = realm.objectForPrimaryKey<GameSchema>('Game', gameId)
//     if (!game) return

//     const points = realm.objects<PointSchema>('Point')
//     // const pointQuery = game.points.map(id => `_id = "${id}"`).join(' OR ')
//     // const gamePoints = points.filtered(pointQuery)

//     const actions = realm.objects<ActionSchema>('Action')
//     const actionQuery = gamePoints
//         .map(point => `pointId = "${point._id}"`)
//         .join(' OR ')
//     const gameActions = actions.filtered(actionQuery)

//     realm.write(() => {
//         realm.delete(gameActions)
//         realm.delete(gamePoints)
//         realm.delete(game)
//     })
// }
