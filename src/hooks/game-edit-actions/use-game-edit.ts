import { ApiError } from '../../types/services'
import { GameSchema } from '../../models'
import { UpdateGame } from '../../types/game'
import { editGame } from '../../services/network/game'
import { parseUpdateGame } from '../../utils/game'
import { useMutation } from 'react-query'
import { withGameToken } from '../../services/data/game'
import { useObject, useRealm } from '../../context/realm'

export const useGameEditor = (gameId: string) => {
    const realm = useRealm()
    const game = useObject<GameSchema>('Game', gameId)

    const { mutateAsync, isLoading, error } = useMutation<
        void,
        ApiError,
        UpdateGame
    >(async (gameData: UpdateGame) => {
        const data = parseUpdateGame(gameData)
        const response = await withGameToken(editGame, data)
        const { game: gameResponse } = response.data

        const schema = new GameSchema(gameResponse, false, game?.statsPoints)
        realm.write(() => {
            realm.delete(game)

            realm.create('Game', schema)
        })
    })

    return {
        game,
        mutateAsync,
        isLoading,
        error,
    }
}
