import * as Constants from '../../utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DisplayUser } from '../../types/user'
import { getRealm } from '../../models/realm'
import { throwApiError } from '../../utils/service-utils'
import { ActionSchema, GameSchema, PointSchema } from '../../models'
import { CreateGame, Game } from '../../types/game'

const parseGame = (schema: GameSchema): Game & { offline: boolean } => {
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
            teamOneActive: schema.teamOneActive,
            teamTwoActive: schema.teamTwoActive,
            teamOnePlayers: schema.teamOnePlayers,
            teamTwoPlayers: schema.teamTwoPlayers,
            resolveCode: schema.resolveCode,
            points: schema.points,
            offline: schema.offline,
        }),
    )
}

/**
 * Method to determine if currently active game is offline
 * @returns boolean indicating current game is offline or not
 */
export const activeGameOffline = async (): Promise<boolean> => {
    return (await AsyncStorage.getItem('active_game_offline')) === 'true'
}

/**
 * Method to get the ObjectId of the current active game
 * @returns current active game id
 */
export const activeGameId = async (): Promise<string> => {
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
        )
        id = game._id
    })

    return id
}

export const saveGame = async (game: Game) => {
    const realm = await getRealm()
    const gameRecord = await realm.objectForPrimaryKey<GameSchema>(
        'Game',
        game._id,
    )
    let offline = false
    if (gameRecord) {
        offline = gameRecord.offline
    }
    const schema = new GameSchema(game, offline)
    realm.write(() => {
        realm.create('Game', schema, Realm.UpdateMode.Modified)
    })
}

export const getGameById = async (
    gameId: string,
): Promise<Game & { offline: boolean }> => {
    const realm = await getRealm()
    const game = await realm.objectForPrimaryKey<GameSchema>('Game', gameId)
    if (!game) {
        return throwApiError({}, Constants.GET_GAME_ERROR)
    }
    return parseGame(game)
}

export const activeGames = async (
    userId: string,
): Promise<(Game & { offline: boolean })[]> => {
    const realm = await getRealm()
    const games = await realm.objects<GameSchema>('Game')

    return games
        .filter(g => g.creator._id === userId)
        .map(game => parseGame(game))
}

export const deleteFullGame = async (gameId: string): Promise<void> => {
    const realm = await getRealm()
    const game = await realm.objectForPrimaryKey<GameSchema>('Game', gameId)

    const points = game?.points.map(id => {
        return realm.objectForPrimaryKey<PointSchema>('Point', id)
    })

    const actions: (ActionSchema | null)[] = []
    points?.forEach(p => {
        p?.teamOneActions.forEach(id => {
            const objectId = new Realm.BSON.ObjectID(id)
            actions.push(
                realm.objectForPrimaryKey<ActionSchema>('Action', objectId),
            )
        })
        p?.teamTwoActions.forEach(id => {
            const objectId = new Realm.BSON.ObjectID(id)
            actions.push(
                realm.objectForPrimaryKey<ActionSchema>('Action', objectId),
            )
        })
    })

    realm.write(() => {
        realm.delete(actions.filter(a => a !== null))
        realm.delete(points?.filter(p => p !== null))
        realm.delete(game)
    })
}
