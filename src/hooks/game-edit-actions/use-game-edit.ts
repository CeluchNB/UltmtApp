import { ApiError } from '../../types/services'
import { GameSchema } from '../../models'
import { UpdateGame } from '../../types/game'
import { UpdateMode } from 'realm'
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

        const parsedValues: UpdateGame = {
            ...gameData,
            floaterTimeout: gameData.floaterTimeout ?? game.floaterTimeout,
            halfScore: Number(gameData.halfScore ?? game.halfScore),
            hardcapMins: Number(gameData.hardcapMins ?? game.hardcapMins),
            softcapMins: Number(gameData.softcapMins ?? game.softcapMins),
            playersPerPoint: Number(
                gameData.playersPerPoint ?? game.playersPerPoint,
            ),
            scoreLimit: Number(gameData.scoreLimit ?? game.scoreLimit),
            timeoutPerHalf: Number(
                gameData.timeoutPerHalf ?? game.timeoutPerHalf,
            ),
        }

        const schema = new GameSchema(
            {
                ...game,
                ...parsedValues,
                totalViews: 0,
            },
            true,
            game.statsPoints,
        )
        // TODO: update team one players
        realm.write(() => {
            realm.create('Game', schema, UpdateMode.Modified)
        })
    }

    const onlineEdit = async (gameData: UpdateGame) => {
        const data = parseUpdateGame(gameData)
        const response = await withGameToken(editGame, data)
        const { game: gameResponse } = response.data

        const schema = new GameSchema(gameResponse, false, game?.statsPoints)
        // TODO: update team one and two players
        realm.write(() => {
            realm.create('Game', schema, UpdateMode.Modified)
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
