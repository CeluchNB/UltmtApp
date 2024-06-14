import { ApiError } from '../types/services'
import { CreateGame } from '../types/game'
import EncryptedStorage from 'react-native-encrypted-storage'
import { UpdateMode } from 'realm'
import { createGame as networkCreateGame } from '../services/network/game'
import { useMutation } from 'react-query'
import { withToken } from '../services/data/auth'
import { GameSchema, TeamSchema } from '../models'
import { useObject, useRealm } from '../context/realm'

export const useCreateGame = (teamOneId?: string) => {
    const realm = useRealm()
    const team = useObject<TeamSchema>('Team', teamOneId ?? '')

    const createOfflineGame = async (gameData: CreateGame) => {
        if (!team) throw new ApiError('Creating team does not exist')

        const schema = GameSchema.createOfflineGame(
            gameData,
            team?.players ?? [],
        )

        realm.write(() => {
            realm.create('Game', schema, UpdateMode.Modified)
        })
        return schema
    }

    const createOnlineGame = async (gameData: CreateGame) => {
        const response = await withToken(networkCreateGame, gameData)
        const { game, token } = response.data

        await EncryptedStorage.setItem('game_token', token)
        const schema = new GameSchema(game)

        realm.write(() => {
            realm.create('Game', schema, UpdateMode.Modified)
        })
        return schema
    }

    return useMutation(
        async ({
            gameData,
            offline,
        }: {
            gameData: CreateGame
            offline: boolean
        }) => {
            if (offline) {
                return await createOfflineGame(gameData)
            } else {
                return await createOnlineGame(gameData)
            }
        },
    )
}
