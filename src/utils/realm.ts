import { Realm } from '@realm/react'
import { DisplayUser, GuestUser } from '../types/user'

export const createGuestPlayer = (player: GuestUser): DisplayUser => {
    return {
        _id: new Realm.BSON.ObjectID().toHexString(),
        ...player,
        username: 'guest',
    }
}
