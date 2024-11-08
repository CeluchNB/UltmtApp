import { DisplayUser } from '../types/user'
import { Line } from '../types/game'
import { Realm } from '@realm/react'

export class LineSchema {
    static schema: Realm.ObjectSchema = {
        name: 'Line',
        primaryKey: '_id',
        properties: {
            _id: 'objectId',
            gameId: 'string',
            name: 'string',
            players: 'DisplayUser[]',
        },
    }

    _id?: Realm.BSON.ObjectId
    gameId: string
    name: string
    players: DisplayUser[]

    constructor(line: Line) {
        this._id = new Realm.BSON.ObjectId()
        this.gameId = line.gameId
        this.name = line.name
        this.players = line.players
    }
}
