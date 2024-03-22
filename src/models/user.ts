import { Realm } from '@realm/react'

export const DisplayUserSchema: Realm.ObjectSchema = {
    name: 'DisplayUser',
    embedded: true,
    properties: {
        _id: 'string',
        firstName: 'string',
        lastName: 'string',
        username: 'string',
        localGuest: 'bool?',
    },
}
