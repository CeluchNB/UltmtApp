import { ClientAction, SubscriptionObject } from '../../types/action'
import {
    createAction as networkCreateAction,
    joinPoint as networkJoinPoint,
    subscribe as networkSubscribe,
    undoAction as networkUndoAction,
} from '../network/live-action'

/**
 * Method to join a point
 * @param gameId id of game to join
 * @param pointId id of point to join
 */
export const joinPoint = async (gameId: string, pointId: string) => {
    await networkJoinPoint(gameId, pointId)
}

/**
 * Method to create an action
 * @param action action data
 * @param pointId point action belongs to
 */
export const addAction = async (action: ClientAction, pointId: string) => {
    await networkCreateAction(action, pointId)
}

/**
 * Method to undo an action
 * @param pointId undo last action on point of this id
 */
export const undoAction = async (pointId: string) => {
    await networkUndoAction(pointId)
}
/**
 * Method to listen to specific action events
 * @param subscriptions object containing subscription types and methods
 */
export const subscribe = async (subscriptions: SubscriptionObject) => {
    await networkSubscribe(subscriptions)
}