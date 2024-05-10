import { config } from '../models/realm'
import { createRealmContext } from '@realm/react'

const context = createRealmContext(config)

export const { RealmProvider, useObject } = context
