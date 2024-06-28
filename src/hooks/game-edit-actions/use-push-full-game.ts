import { ApiError } from '../../types/services'
import { parseClientAction } from '../../utils/action'
import { parseClientPoint } from '../../utils/point'
import { parseFullGame } from '../../utils/game'
import { pushOfflineGame } from '../../services/network/game'
import { useMutation } from 'react-query'
import { useRealm } from '../../context/realm'
import { withToken } from '../../services/data/auth'
import { ActionSchema, GameSchema, PointSchema } from '../../models'

export const usePushFullGame = () => {
    const realm = useRealm()

    return useMutation<void, ApiError, string>(async (gameId: string) => {
        const game = realm.objectForPrimaryKey<GameSchema>('Game', gameId)
        if (!game) return

        const points = realm
            .objects<PointSchema>('Point')
            .filtered('gameId == $0', gameId)

        const fullGame = parseFullGame(game)

        for (const point of points) {
            const actions = realm
                .objects<ActionSchema>('Action')
                .filtered('pointId == $0', point._id)

            const fullPoint = parseClientPoint(point)

            fullPoint.actions = actions.map(a => parseClientAction(a))
            fullGame.points.push(fullPoint)
        }

        const response = await withToken(pushOfflineGame, fullGame)
        // TODO: GAME-REFACTOR handle guests returned

        const gameActions = realm.objects<ActionSchema>('Action').filtered(
            'pointId IN $0',
            points.map(p => p._id),
        )

        realm.write(() => {
            realm.delete(game)
            realm.delete(points)
            realm.delete(gameActions)
        })
    })
}
