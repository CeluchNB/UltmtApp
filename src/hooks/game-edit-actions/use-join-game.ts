import { ApiError } from '../../types/services'
import { CreateGameContext } from '../../context/create-game-context'
import EncryptedStorage from 'react-native-encrypted-storage'
import { GameSchema } from '../../models'
import { UpdateMode } from 'realm'
import { joinGame } from '../../services/network/game'
import { useContext } from 'react'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'
import { withToken } from '../../services/data/auth'

export const useJoinGame = () => {
    const { teamOne } = useContext(CreateGameContext)
    const realm = useRealm()

    return useMutation<void, ApiError, { gameId: string; code: string }>(
        async ({ gameId, code }: { gameId: string; code: string }) => {
            if (!teamOne)
                throw new ApiError('You must select your own team first')
            const response = await withToken(
                joinGame,
                gameId,
                teamOne._id,
                code,
            )
            if (response.status !== 200) {
                throw new ApiError(response.data.message)
            }

            const { game, token } = response.data
            await EncryptedStorage.setItem('game_token', token)

            const schema = new GameSchema(game)
            realm.write(() => {
                realm.create('Game', schema, UpdateMode.Modified)
            })
        },
    )
}
