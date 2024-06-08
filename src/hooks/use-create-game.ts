import { CreateGame } from '../types/game'
import EncryptedStorage from 'react-native-encrypted-storage'
import { GameSchema } from '../models'
import { createGame as networkCreateGame } from '../services/network/game'
import { useMutation } from 'react-query'
import { useRealm } from '../context/realm'
import { withToken } from '../services/data/auth'

export const useCreateGame = () => {
    const realm = useRealm()

    return useMutation(async (gameData: CreateGame) => {
        // TODO: GAME-REFACTOR offline game creation
        const response = await withToken(networkCreateGame, gameData)
        const { game, token } = response.data

        await EncryptedStorage.setItem('game_token', token)
        const schema = new GameSchema(game)
        realm.write(() => {
            realm.create('Game', schema)
        })
        return schema
    })
}
