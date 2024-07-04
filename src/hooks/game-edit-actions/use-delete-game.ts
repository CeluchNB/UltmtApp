import EncryptedStorage from 'react-native-encrypted-storage'
import { GameSchema } from '../../models'
import { deleteGame } from '../../services/network/game'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'
import { withToken } from '../../services/data/auth'

export const useDeleteGame = () => {
    const realm = useRealm()

    return useMutation(
        async ({ gameId, teamId }: { gameId: string; teamId: string }) => {
            const game = realm.objectForPrimaryKey<GameSchema>('Game', gameId)

            if (!game?.offline) {
                await withToken(deleteGame, gameId, teamId)
            }

            const allPoints = realm.objects('Point')
            const gamePoints = allPoints.filtered('gameId == $0', gameId)
            const gameActions = realm.objects('Action').filtered(
                'pointId IN $0',
                gamePoints.map(p => p._id),
            )

            realm.write(() => {
                if (gameActions.length > 0) {
                    realm.delete(gameActions)
                }
                if (gamePoints.length > 0) {
                    realm.delete(gamePoints)
                }
                if (game) {
                    realm.delete(game)
                }
            })

            EncryptedStorage.setItem('game_token', '')
        },
    )
}
