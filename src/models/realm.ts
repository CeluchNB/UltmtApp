import { Realm } from '@realm/react'
import {
    ActionSchema,
    CommentSchema,
    DisplayTeamSchema,
    DisplayUserSchema,
    GameSchema,
    GuestTeamSchema,
    LineSchema,
    PlayerPointStatsSchema,
    PointSchema,
    PointStatsSchema,
    TeamSchema,
    TournamentSchema,
} from './index'

export const SCHEMAS = [
    DisplayTeamSchema,
    DisplayUserSchema,
    GameSchema.schema,
    GuestTeamSchema,
    TournamentSchema.schema,
    PointSchema.schema,
    ActionSchema.schema,
    CommentSchema,
    TeamSchema.schema,
    PlayerPointStatsSchema,
    PointStatsSchema,
    LineSchema.schema,
]

export const config: Realm.Configuration = {
    schema: SCHEMAS,
    deleteRealmIfMigrationNeeded: true,
    schemaVersion: 1,
    // shouldCompactOnLaunch: function (_totalSize: number, _usedSpace: number) {
    //     // TODO: should implement this, but never seems to be called?
    //     return false
    // },
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
