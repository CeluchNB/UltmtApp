import { ACTION_MAP, ActionType } from '../types/action'

/**
 * Method to determine the next valid action options for a player
 * @param user index of user calling the method (0-6)
 * @param actingUser index of user 'involved' in the most recent action (0-6)
 * @param action action that just occurred
 * @param pulling handle initial case, true = pulling, false = receiving, undefined = non-pulling action
 * @returns array of valid action
 */
export const getPlayerValidActions = (
    user: number,
    actingUser: number,
    action?: string,
    pulling?: boolean,
): ActionType[] | string[] => {
    if (!action) {
        if (pulling) {
            return ACTION_MAP.PULLING
        }
        return ACTION_MAP.RECEIVING
    }

    switch (action) {
        case ActionType.PULL:
            return ACTION_MAP.DEFENSE
        case ActionType.PICKUP:
        case ActionType.CATCH:
            if (user === actingUser) {
                return ACTION_MAP.OFFENSE_WITH_POSSESSION
            } else {
                return ACTION_MAP.OFFENSE_NO_POSSESSION
            }
        case ActionType.DROP:
        case ActionType.THROWAWAY:
            return ACTION_MAP.DEFENSE
        case ActionType.BLOCK:
            return ACTION_MAP.DEFENSE_AFTER_BLOCK
    }

    return ACTION_MAP.OFFENSE_NO_POSSESSION
}
