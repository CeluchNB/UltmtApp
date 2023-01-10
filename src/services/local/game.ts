import { Game } from '../../types/game'
import { withRealm } from '../../models/realm'
import {
    DisplayTeamSchema,
    DisplayUserSchema,
    GameSchema,
    GuestTeamSchema,
    TournamentSchema,
} from '../../models'

const SCHEMAS = [
    DisplayTeamSchema,
    DisplayUserSchema,
    GameSchema,
    GuestTeamSchema,
    TournamentSchema,
]

export const saveGame = async (game: Game) => {
    withRealm(SCHEMAS, realm => {
        realm.write(() => {
            realm.create('Game', game, Realm.UpdateMode.Modified)
        })
    })
}

export const getGameById = async (id: string) => {
    //
}
