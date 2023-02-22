import { ActionType, ClientAction, LiveServerAction } from '../types/action'

/**
 * Method to determine the next valid action options for a player
 * @param user index of user calling the method (0-6)
 * @param actingUser index of user 'involved' in the most recent action (0-6)
 * @param action action that just occurred
 * @param pulling handle initial case, true = pulling, false = receiving, undefined = non-pulling action
 * @returns array of valid action
 */
// export const getValidPlayerActions = (
//     user: DisplayUser,
//     actionStack: LiveServerAction[],
//     pulling?: boolean,
// ): Action[] => {
//     let currentUser: string | undefined = user._id
//     for (const action of actionStack.reverse()) {
//         switch (action.actionType) {
//             case ActionType.PULL:
//                 return ACTION_MAP.DEFENSE
//             case ActionType.PICKUP:
//             case ActionType.CATCH:
//                 if (currentUser === action.playerOne?._id) {
//                     return ACTION_MAP.OFFENSE_WITH_POSSESSION
//                 } else {
//                     return ACTION_MAP.OFFENSE_NO_POSSESSION
//                 }
//             case ActionType.DROP:
//             case ActionType.THROWAWAY:
//                 return ACTION_MAP.DEFENSE
//             case ActionType.BLOCK:
//                 return ACTION_MAP.DEFENSE_AFTER_BLOCK
//             case ActionType.TEAM_ONE_SCORE:
//             case ActionType.TEAM_TWO_SCORE:
//                 return ACTION_MAP.AFTER_SCORE
//             case ActionType.TIMEOUT:
//             case ActionType.CALL_ON_FIELD:
//                 continue
//             case ActionType.SUBSTITUTION:
//                 // if we are getting actions for newly substituted user
//                 if (user._id === action.playerTwo?._id) {
//                     // inherit the actions from the player that was substituted for
//                     currentUser = action.playerOne?._id
//                 }
//                 continue
//         }
//     }

//     if (pulling) {
//         return ACTION_MAP.PULLING
//     }
//     return ACTION_MAP.RECEIVING
// }

/**
 * Gets the valid options for the team's next actions
 * @param actionStack list of previous actions
 * @returns one of TEAM_ACTION_MAP's values
 */
// export const getValidTeamActions = (
//     actionStack: { actionType: ActionType }[],
// ): Action[] => {
//     for (const action of actionStack.slice().reverse()) {
//         if (
//             action.actionType === ActionType.TEAM_ONE_SCORE ||
//             action.actionType === ActionType.TEAM_TWO_SCORE
//         ) {
//             return TEAM_ACTION_MAP.PREPOINT
//         } else if (
//             [ActionType.BLOCK, ActionType.PICKUP, ActionType.CATCH].includes(
//                 action.actionType,
//             )
//         ) {
//             return TEAM_ACTION_MAP.OFFENSE
//         } else if (
//             [ActionType.PULL, ActionType.DROP, ActionType.THROWAWAY].includes(
//                 action.actionType,
//             )
//         ) {
//             return TEAM_ACTION_MAP.DEFENSE
//         }
//     }
//     return TEAM_ACTION_MAP.PREPOINT
// }

/**
 * Get an action object based on the input parameters
 * @param action type of action
 * @param team team action relates to
 * @param tags optional tags related to action
 * @param playerOne player one of action
 * @param playerTwo player two of action
 * @returns action object
 */
// export const getAction = (
//     action: ActionType,
//     team: TeamNumber,
//     tags: string[],
//     playerOne?: DisplayUser,
//     playerTwo?: DisplayUser,
// ): ClientAction => {
//     let actionType: ActionType
//     if (action === 'score' && team === 'one') {
//         actionType = ActionType.TEAM_ONE_SCORE
//     } else if (action === 'score' && team === 'two') {
//         actionType = ActionType.TEAM_TWO_SCORE
//     } else {
//         actionType = action as ActionType
//     }

//     if (
//         action !== 'score' &&
//         [
//             ActionType.PULL,
//             ActionType.THROWAWAY,
//             ActionType.BLOCK,
//             ActionType.PICKUP,
//             ActionType.TIMEOUT,
//             ActionType.CALL_ON_FIELD,
//         ].includes(action)
//     ) {
//         return {
//             actionType,
//             playerOne,
//             tags: tags,
//         }
//     }
//     return {
//         actionType,
//         playerOne,
//         playerTwo,
//         tags,
//     }
// }

/**
 * Method to get action data for a team action
 * @param action action type
 * @param team team number
 * @param tags any tags
 * @param playerOne optional player one
 * @param playerTwo optional player two
 * @returns action data for team
 */
// export const getTeamAction = (
//     action: ActionType,
//     team: TeamNumber,
//     tags: string[],
//     playerOne?: DisplayUser,
//     playerTwo?: DisplayUser,
// ): ClientAction => {
//     let actionType: ActionType
//     if (action === 'score') {
//         if (team === 'one') {
//             actionType = ActionType.TEAM_TWO_SCORE
//         } else {
//             actionType = ActionType.TEAM_ONE_SCORE
//         }
//         return {
//             actionType,
//             tags,
//         }
//     }
//     if (action === ActionType.CALL_ON_FIELD) {
//         return {
//             actionType: action,
//             playerOne,
//             tags,
//         }
//     }

//     return {
//         actionType: action,
//         playerOne,
//         playerTwo,
//         tags,
//     }
// }

/**
 * Method to get an action's appropriate display name
 * @param action action name
 * @returns display friendly name
 */
// export const mapActionToDisplayName = (action: ActionType) => {
//     switch (action) {
//         case 'score':
//             return 'they score'
//         case ActionType.CALL_ON_FIELD:
//             return 'call on field'
//         default:
//             return action
//     }
// }

/**
 * Method to get a user friendly description from an action type.
 * @param type action type
 * @returns user friendly description
 */
export const mapActionToDescription = (type: ActionType): string => {
    switch (type) {
        case ActionType.BLOCK:
            return ' block '
        case ActionType.CALL_ON_FIELD:
            return 'There is a call on the field'
        case ActionType.CATCH:
            return ' catch from '
        case ActionType.DROP:
            return ' drops pass from '
        case ActionType.PICKUP:
            return ' picks up the disc'
        case ActionType.PULL:
            return ' pulls'
        case ActionType.SUBSTITUTION:
            return ' subs in for '
        case ActionType.TEAM_ONE_SCORE:
            return ' scores from '
        case ActionType.TEAM_TWO_SCORE:
            return ' scores from '
        case ActionType.THROWAWAY:
            return ' throwaway'
        case ActionType.TIMEOUT:
            return 'Timeout called'
    }
}

export const parseClientAction = (action: LiveServerAction): ClientAction => {
    return {
        tags: action.tags,
        playerOne: action.playerOne,
        playerTwo: action.playerTwo,
        actionType: action.actionType,
    }
}
