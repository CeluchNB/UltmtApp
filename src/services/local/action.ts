import AsyncStorage from '@react-native-async-storage/async-storage'
import { SavedServerAction } from '../../types/action'

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
