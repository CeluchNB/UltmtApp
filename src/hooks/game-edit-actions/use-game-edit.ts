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

    const offlineEdit = async (gameData: UpdateGame) => {
        if (!game) return

        realm.write(() => {
            game.floaterTimeout = gameData.floaterTimeout ?? game.floaterTimeout
            game.halfScore = Number(gameData.halfScore ?? game.halfScore)
            game.hardcapMins = Number(gameData.hardcapMins ?? game.hardcapMins)
            game.softcapMins = Number(gameData.softcapMins ?? game.softcapMins)
            game.playersPerPoint = Number(
                gameData.playersPerPoint ?? game.playersPerPoint,
            )
            game.scoreLimit = Number(gameData.scoreLimit ?? game.scoreLimit)
            game.timeoutPerHalf = Number(
                gameData.timeoutPerHalf ?? game.timeoutPerHalf,
            )
        })
    }

    const onlineEdit = async (gameData: UpdateGame) => {
        if (!game) return

        const data = parseUpdateGame(gameData)
        const response = await withGameToken(editGame, data)
        const { game: gameResponse } = response.data

        realm.write(() => {
            game.floaterTimeout =
                gameResponse.floaterTimeout ?? game.floaterTimeout
            game.halfScore = Number(gameResponse.halfScore ?? game.halfScore)
            game.hardcapMins = Number(
                gameResponse.hardcapMins ?? game.hardcapMins,
            )
            game.softcapMins = Number(
                gameResponse.softcapMins ?? game.softcapMins,
            )
            game.playersPerPoint = Number(
                gameResponse.playersPerPoint ?? game.playersPerPoint,
            )
            game.scoreLimit = Number(gameResponse.scoreLimit ?? game.scoreLimit)
            game.timeoutPerHalf = Number(
                gameResponse.timeoutPerHalf ?? game.timeoutPerHalf,
            )
        })
    }

    const { mutateAsync, isLoading, error } = useMutation<
        void,
        ApiError,
        UpdateGame
    >(async (gameData: UpdateGame) => {
        if (game?.offline) {
            await offlineEdit(gameData)
        } else {
            await onlineEdit(gameData)
        }
    })

    return {
        game,
        mutateAsync,
        isLoading,
        error,
    }
}
