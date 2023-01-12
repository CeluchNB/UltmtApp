import * as Constants from '../../utils/constants'
import EncryptedStorage from 'react-native-encrypted-storage'
import { Game } from '../../types/game'
import { GameSchema } from '../../models'
import { getRealm } from '../../models/realm'
import jwt_decode from 'jwt-decode'
import { throwApiError } from '../../utils/service-utils'

const parseGame = (schema: GameSchema): Game => {
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
        }),
    )
}

export const getLocalGameId = async (): Promise<string> => {
    const token = (await EncryptedStorage.getItem('game_token')) || ''
    const data = jwt_decode(token) as { sub: string }

    return data.sub
}

export const saveGame = async (game: Game) => {
    const realm = await getRealm()
    realm.write(() => {
        realm.create('Game', game, Realm.UpdateMode.Modified)
    })
}

export const getGameById = async (gameId: string): Promise<Game> => {
    const realm = await getRealm()
    const game = await realm.objectForPrimaryKey<GameSchema>('Game', gameId)
    if (!game) {
        return throwApiError({}, Constants.GET_GAME_ERROR)
    }
    return parseGame(game)
}

export const activeGames = async (userId: string): Promise<Game[]> => {
    const realm = await getRealm()
    const games = await realm.objects<GameSchema>('Game')

    return games.filter(g => g.creator._id === userId)
}

export const deleteGame = async (id: string): Promise<void> => {
    const realm = await getRealm()
    realm.write(async () => {
        const game = await realm.objectForPrimaryKey('Game', id)
        realm.delete(game)
    })
}
