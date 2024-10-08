import * as Constants from '../../utils/constants'
import { ActionSchema } from '../../models'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Realm } from '@realm/react'
import { TeamNumber } from '../../types/team'
import { getRealm } from '../../models/realm'
import { parseAction } from '../../utils/action'
import { throwApiError } from '../../utils/service-utils'
import { LiveServerActionData, SavedServerActionData } from '../../types/action'

/**
 * Method to save actions locally
 * @param pointId id of point actions belong to
 * @param actions list of action objects
 */
export const saveDisplayActions = async (
    pointId: string,
    actions: SavedServerActionData[],
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
export const getDisplayActions = async (
    pointId: string,
    actionIds: string[],
): Promise<SavedServerActionData[]> => {
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
export const deleteAllDisplayActionsByPoint = async (pointId: string) => {
    const keys = await AsyncStorage.getAllKeys()
    const filteredKeys = keys.filter(key => key.includes(pointId))
    await AsyncStorage.multiRemove(filteredKeys)
}

export const upsertAction = async (
    action: LiveServerActionData,
    pointId: string,
): Promise<LiveServerActionData & { _id: string; pointId: string }> => {
    const realm = await getRealm()

    const currentActionQuery = await realm.objects<ActionSchema>('Action')
    const currentAction = currentActionQuery.filtered(
        `teamNumber == "${action.teamNumber}" && actionNumber == ${action.actionNumber} && pointId == "${pointId}"`,
    )[0]

    const currentId = currentAction?._id
    const newAction = new ActionSchema(action, pointId, currentId)
    realm.write(() => {
        realm.create<ActionSchema>(
            'Action',
            { ...newAction },
            Realm.UpdateMode.Modified,
        )
    })
    const allActions = await realm.objects<ActionSchema>('Action')
    const result = allActions.filtered(
        `teamNumber == "${action.teamNumber}" && actionNumber == ${action.actionNumber} && pointId == "${pointId}"`,
    )[0]

    if (!result) {
        return throwApiError({}, Constants.GET_ACTION_ERROR)
    }
    return parseAction(result)
}

export const saveMultipleServerActions = async (
    actions: LiveServerActionData[],
    pointId: string,
): Promise<void> => {
    const realm = await getRealm()

    realm.write(() => {
        for (const action of actions) {
            realm.create(
                'Action',
                { ...action, _id: new Realm.BSON.ObjectId(), pointId },
                Realm.UpdateMode.All,
            )
        }
    })
}

export const deleteAction = async (
    teamNumber: TeamNumber,
    actionNumber: number,
    pointId: string,
): Promise<LiveServerActionData> => {
    const realm = await getRealm()
    const actions = await realm.objects<ActionSchema>('Action')
    const action = actions.filtered(
        `teamNumber == "${teamNumber}" && actionNumber == ${actionNumber} && pointId == "${pointId}"`,
    )[0]

    const result = parseAction(action)
    realm.write(() => {
        realm.delete(action)
    })
    return result
}

export const deleteEditableActionsByPoint = async (
    team: TeamNumber,
    pointId: string,
): Promise<void> => {
    const realm = await getRealm()
    const actions = await realm
        .objects<ActionSchema>('Action')
        .filtered(`teamNumber == "${team}" && pointId == "${pointId}"`)
    realm.write(() => {
        realm.delete(actions)
    })
}

export const getActionById = async (
    actionId: string,
): Promise<LiveServerActionData> => {
    const realm = await getRealm()
    const action = await realm.objectForPrimaryKey<ActionSchema>(
        'Action',
        actionId,
    )
    if (!action) {
        return throwApiError({}, Constants.GET_ACTION_ERROR)
    }
    return parseAction(action)
}

export const getActionsByPoint = async (
    pointId: string,
): Promise<(LiveServerActionData & { _id: string; pointId: string })[]> => {
    const realm = await getRealm()
    const actions = await realm
        .objects<ActionSchema>('Action')
        .filtered(`pointId == "${pointId}"`)

    return actions.map(action => {
        return parseAction(action)
    })
}
