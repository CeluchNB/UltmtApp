import { GuestUser } from '../types/user'
import {
    ACTION_MAP,
    ActionType,
    ClientAction,
    ClientActionType,
    TEAM_ACTION_MAP,
} from '../types/action'

/**
 * Method to determine the next valid action options for a player
 * @param user index of user calling the method (0-6)
 * @param actingUser index of user 'involved' in the most recent action (0-6)
 * @param action action that just occurred
 * @param pulling handle initial case, true = pulling, false = receiving, undefined = non-pulling action
 * @returns array of valid action
 */
export const getValidPlayerActions = (
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

/**
 * Gets the valid options for the team's next actions
 * @param actionStack list of previous actions
 * @returns one of TEAM_ACTION_MAP's values
 */
export const getValidTeamActions = (
    actionStack: { playerIndex: number; actionType: ClientActionType }[],
) => {
    for (const action of actionStack.slice().reverse()) {
        console.log('action type', action)
        if (action.actionType === 'score') {
            return TEAM_ACTION_MAP.PREPOINT
        } else if (
            [ActionType.BLOCK, ActionType.PICKUP, ActionType.CATCH].includes(
                action.actionType,
            )
        ) {
            return TEAM_ACTION_MAP.OFFENSE
        } else if (
            [ActionType.PULL, ActionType.DROP, ActionType.THROWAWAY].includes(
                action.actionType,
            )
        ) {
            return TEAM_ACTION_MAP.DEFENSE
        }
    }
    return TEAM_ACTION_MAP.PREPOINT
}

/**
 * Get an action object based on the input parameters
 * @param action type of action
 * @param team team action relates to
 * @param tags optional tags related to action
 * @param playerOne player one of action
 * @param playerTwo player two of action
 * @returns action object
 */
export const getAction = (
    action: ClientActionType,
    team: 'one' | 'two',
    tags: string[],
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
            tags: tags,
        }
    }
    return {
        actionType,
        playerOne,
        playerTwo,
        tags,
    }
}

/**
 * Method to get an action's appropriate display name
 * @param action action name
 * @returns display friendly name
 */
export const mapActionToDisplayName = (action: ClientActionType) => {
    switch (action) {
        case 'score':
            return 'they score'
        case ActionType.CALL_ON_FIELD:
            return 'call on field'
        default:
            return action
    }
}
