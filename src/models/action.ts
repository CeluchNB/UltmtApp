import { DisplayUser } from '../types/user'
import { Realm } from '@realm/react'
import { TeamNumber } from '../types/team'
import { ActionType, Comment, LiveServerActionData } from '../types/action'

export const CommentSchema: Realm.ObjectSchema = {
    name: 'Comment',
    embedded: true,
    properties: {
        user: 'DisplayUser',
        comment: 'string',
        commentNumber: 'int',
    },
}

export class ActionSchema {
    static schema: Realm.ObjectSchema = {
        name: 'Action',
        primaryKey: '_id',
        properties: {
            _id: 'objectId',
            pointId: 'string',
            actionType: 'string',
            actionNumber: 'int',
            playerOne: 'DisplayUser?',
            playerTwo: 'DisplayUser?',
            tags: 'string[]',
            teamNumber: 'string',
            comments: 'Comment[]',
        },
    }

    _id: Realm.BSON.ObjectId
    pointId: string
    actionType: ActionType
    playerOne?: DisplayUser
    playerTwo?: DisplayUser
    tags: string[]
    actionNumber: number
    teamNumber: TeamNumber
    comments: Comment[]

    constructor(action: LiveServerActionData, pointId: string) {
        this._id = new Realm.BSON.ObjectID()
        this.pointId = pointId
        this.actionType = action.actionType
        this.playerOne = action.playerOne
        this.playerTwo = action.playerTwo
        this.tags = action.tags
        this.actionNumber = action.actionNumber
        this.teamNumber = action.teamNumber
        this.comments = action.comments
    }
}
