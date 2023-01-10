import { Realm } from '@realm/react'

export const withRealm = async (
    schemas: Realm.ObjectSchema[],
    method: (realm: Realm) => void,
) => {
    try {
        const realm = await Realm.open({
            schema: schemas,
        })

        method(realm)
        realm.close()
    } catch (error) {
        throw error
    }
}
