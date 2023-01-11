import { Realm } from '@realm/react'
import {
    DisplayTeamSchema,
    DisplayUserSchema,
    GameSchema,
    GuestTeamSchema,
    TournamentSchema,
} from './index'

const SCHEMAS = [
    DisplayTeamSchema,
    DisplayUserSchema,
    GameSchema.schema,
    GuestTeamSchema,
    TournamentSchema,
]

const config = {
    schema: SCHEMAS,
}

let realm: Realm | undefined

export const getRealm = async (): Promise<Realm> => {
    try {
        if (!realm || realm.isClosed) {
            realm = await Realm.open(config)
        }
        return realm
    } catch (error) {
        throw error
    }
}

export const closeRealm = () => {
    realm?.close()
}
