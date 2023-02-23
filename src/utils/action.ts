import { ActionType, ClientAction, ServerAction } from '../types/action'

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

export const parseClientAction = (action: ServerAction): ClientAction => {
    return {
        tags: action.tags,
        playerOne: action.playerOne,
        playerTwo: action.playerTwo,
        actionType: action.actionType,
    }
}

export const isScore = (type: ActionType): boolean => {
    return [ActionType.TEAM_ONE_SCORE, ActionType.TEAM_TWO_SCORE].includes(type)
}

export const isTurnover = (type: ActionType): boolean => {
    return [ActionType.PULL, ActionType.DROP, ActionType.THROWAWAY].includes(
        type,
    )
}

export const isRetainingPossession = (type: ActionType): boolean => {
    return [ActionType.BLOCK, ActionType.PICKUP, ActionType.CATCH].includes(
        type,
    )
}
