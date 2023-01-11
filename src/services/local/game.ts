import { Game } from '../../types/game'
import { GameSchema } from '../../models'
import { getRealm } from '../../models/realm'

export const saveGame = async (game: Game) => {
    const realm = await getRealm()
    realm.write(() => {
        realm.create('Game', game, Realm.UpdateMode.Modified)
    })
}

export const activeGames = async (): Promise<Game[]> => {
    const realm = await getRealm()
    const games = await realm.objects<GameSchema>('Game')

    return games.map(g => g)
}

export const deleteGame = async (id: string): Promise<void> => {
    const realm = await getRealm()
    realm.write(async () => {
        const game = await realm.objectForPrimaryKey('Game', id)
        realm.delete(game)
    })
}
