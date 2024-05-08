import { CreateGame } from '../types/game'
import { DisplayUser } from '../types/user'
import { GameSchema } from '../models'
import { createGame as networkCreateGame } from '../services/network/game'
import { useMutation } from 'react-query'
import { useState } from 'react'
import { withToken } from '../services/data/auth'
import { useObject, useRealm } from '@realm/react'

// TODO: use this when liveGameReducer is refactored away
export const useCreateGame = () => {
    const realm = useRealm()
    const [gameId, setGameId] = useState('')
    const game = useObject<GameSchema>('Game', gameId)

    const { mutateAsync } = useMutation(async (gameData: CreateGame) => {
        const response = await withToken(networkCreateGame, gameData)
        return response.data.game
    })

    const createGame = async (
        gameData: CreateGame,
        offline: boolean,
        teamOnePlayers?: DisplayUser[],
    ) => {
        if (offline) {
            realm.write(() => {
                const gameResponse = realm.create<GameSchema>(
                    'Game',
                    GameSchema.createOfflineGame(
                        gameData,
                        teamOnePlayers ?? [],
                    ),
                    Realm.UpdateMode.All,
                )
                setGameId(gameResponse._id)
            })
        } else {
            const gameResponse = await mutateAsync(gameData)
            setGameId(gameResponse._id)
            realm.write(() => {
                const schema = new GameSchema(gameResponse, false, [])
                realm.create('Game', schema)
            })
        }
    }

    return { game, createGame }
}
