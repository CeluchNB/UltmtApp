import { GuestUser } from '../types/user'
import { ACTION_MAP, ActionType, ClientAction } from '../types/action'

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
): ('score' | ActionType)[] => {
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

export const getAction = (
    action: ActionType | 'score',
    team: 'one' | 'two',
    playerOne?: GuestUser,
    playerTwo?: GuestUser,
): ClientAction => {
    let actionType: ActionType
    if (action === 'score' && team === 'one') {
        actionType = ActionType.TEAM_ONE_SCORE
    } else if (action === 'score' && team === 'two') {
        actionType = ActionType.TEAM_TWO_SCORE
    } else {
        actionType = action as ActionType
    }

    if (
        action !== 'score' &&
        [
            ActionType.PULL,
            ActionType.THROWAWAY,
            ActionType.BLOCK,
            ActionType.PICKUP,
            ActionType.TIMEOUT,
            ActionType.CALL_ON_FIELD,
        ].includes(action)
    ) {
        return {
            actionType,
            playerOne,
            tags: [],
        }
    }
    return {
        actionType,
        playerOne,
        playerTwo,
        tags: [],
    }
}
