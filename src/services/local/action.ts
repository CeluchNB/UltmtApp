import * as Constants from '../../utils/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Realm } from '@realm/react'
import { getRealm } from '../../models/realm'
import { throwApiError } from '../../utils/service-utils'
import { ActionSchema, PointSchema } from '../../models'
import { LiveServerAction, SavedServerAction } from '../../types/action'

/**
 * Method to save actions locally
 * @param pointId id of point actions belong to
 * @param actions list of action objects
 */
export const saveActions = async (
    pointId: string,
    actions: SavedServerAction[],
) => {
    const pairs: [string, string][] = actions.map(action => [
        `${pointId}:${action._id}`,
        JSON.stringify(action),
    ])
    await AsyncStorage.multiSet(pairs)
}

/**
 * Method to get locally saved actions
 * @param pointId id of point actions belong to
 * @param actionIds list of ids of actions
 * @returns saved user ids or empty if a point is not found
 */
export const getActions = async (
    pointId: string,
    actionIds: string[],
): Promise<SavedServerAction[]> => {
    const keys = actionIds.map(id => `${pointId}:${id}`)
    const actions = await AsyncStorage.multiGet(keys)
    for (const kvp of actions) {
        if (!kvp[1]) {
            return []
        }
    }
    return actions.map(kvp => JSON.parse(kvp[1] || ''))
}

/**
 * Method to remove all locally stored actions from a given point
 * @param pointId point id to remove actions for
 */
export const deleteAllActionsByPoint = async (pointId: string) => {
    const keys = await AsyncStorage.getAllKeys()
    const filteredKeys = keys.filter(key => key.includes(pointId))
    await AsyncStorage.multiRemove(filteredKeys)
}

export const upsertAction = async (
    action: LiveServerAction,
    pointId: string,
): Promise<LiveServerAction> => {
    const realm = await getRealm()
    const point = await realm.objectForPrimaryKey<PointSchema>('Point', pointId)
    if (!point) {
        return throwApiError({}, Constants.GET_POINT_ERROR)
    }
    realm.write(() => {
        const rAction = realm.create<ActionSchema>(
            'Action',
            new ActionSchema(action, pointId),
            Realm.UpdateMode.Modified,
        )
        if (action.teamNumber === 'one') {
            point.teamOneActions = [
                ...new Set([
                    ...point.teamOneActions,
                    rAction._id.toHexString(),
                ]),
            ]
        } else {
            point.teamTwoActions = [
                ...new Set([
                    ...point.teamTwoActions,
                    rAction._id.toHexString(),
                ]),
            ]
        }
    })
    const actions = await realm.objects<ActionSchema>('Action')
    const result = actions.filtered(
        `teamNumber == "${action.teamNumber}" && actionNumber == ${action.actionNumber} && pointId == "${pointId}"`,
    )[0]

    if (!result) {
        return throwApiError({}, Constants.GET_ACTION_ERROR)
    }
    return parseAction(result)
}

export const deleteAction = async (
    teamNumber: 'one' | 'two',
    actionNumber: number,
    pointId: string,
) => {
    const realm = await getRealm()
    const actions = await realm.objects<ActionSchema>('Action')
    const action = actions.filtered(
        `teamNumber == "${teamNumber}" && actionNumber == ${actionNumber} && pointId == "${pointId}"`,
    )[0]
    realm.write(() => {
        realm.delete(action)
    })
}

export const getActionById = async (
    actionId: string,
): Promise<LiveServerAction> => {
    const realm = await getRealm()
    const action = await realm.objectForPrimaryKey<ActionSchema>(
        'Action',
        actionId,
    )
    if (!action) {
        return throwApiError({}, Constants.GET_ACTION_ERROR)
    }
    return parseLiveAction(action)
}

const parseLiveAction = (schema: ActionSchema): LiveServerAction => {
    return {
        actionType: schema.actionType,
        actionNumber: schema.actionNumber,
        teamNumber: schema.teamNumber,
        tags: schema.tags,
        comments: schema.comments,
    }
}

const parseAction = (
    schema: ActionSchema,
): LiveServerAction & { _id: string; pointId: string } => {
    return JSON.parse(
        JSON.stringify({
            _id: schema._id.toHexString(),
            pointId: schema.pointId,
            actionType: schema.actionType,
            actionNumber: schema.actionNumber,
            teamNumber: schema.teamNumber,
            tags: schema.tags,
            comments: schema.comments,
            playerOne: schema.playerOne,
            playerTwo: schema.playerTwo,
        }),
    )
}
