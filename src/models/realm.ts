import { Realm } from '@realm/react'
import {
    ActionSchema,
    CommentSchema,
    DisplayTeamSchema,
    DisplayUserSchema,
    GameSchema,
    GuestTeamSchema,
    PointSchema,
    TournamentSchema,
} from './index'

const SCHEMAS = [
    DisplayTeamSchema,
    DisplayUserSchema,
    GameSchema.schema,
    GuestTeamSchema,
    TournamentSchema,
    PointSchema.schema,
    ActionSchema.schema,
    CommentSchema,
]

const config = {
    schema: SCHEMAS,
    shouldCompactOnLaunch: function (_totalSize: number, _usedSpace: number) {
        // TODO: should implement this, but never seems to be called?
        return false
    },
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
