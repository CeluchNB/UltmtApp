import { DisplayTeam } from './team'
import { GuestUser } from './user'

export enum ActionType {
    PULL = 'Pull',
    CATCH = 'Catch',
    DROP = 'Drop',
    THROWAWAY = 'Throwaway',
    BLOCK = 'Block',
    PICKUP = 'Pickup',
    TEAM_ONE_SCORE = 'TeamOneScore',
    TEAM_TWO_SCORE = 'TeamTwoScore',
    TIMEOUT = 'Timeout',
    SUBSTITUTION = 'Substitution',
    CALL_ON_FIELD = 'CallOnField',
}

export type SubscriptionType = 'client' | 'undo' | 'error' | 'point'
export type SubscriptionObject = {
    [x in SubscriptionType]: (data: any) => void
}

export interface ClientAction {
    actionType: ActionType
    playerOne?: GuestUser
    playerTwo?: GuestUser
    tags: string[]
}

export interface Comment {
    user: GuestUser
    comment: string
    commentNumber: number
}

export interface ServerAction extends ClientAction {
    comments: Comment[]
    actionNumber: number
}

export interface LiveServerAction extends ServerAction {
    teamNumber: 'one' | 'two'
}

export interface SavedServerAction extends ServerAction {
    _id: string
    team: DisplayTeam
}

export type ClientActionType = ActionType | 'score'

export const ACTION_MAP: { [x: string]: ClientActionType[] } = {
    PULLING: [ActionType.PULL],
    RECEIVING: [ActionType.CATCH, ActionType.PICKUP, ActionType.DROP],
    OFFENSE_WITH_POSSESSION: [ActionType.THROWAWAY],
    OFFENSE_NO_POSSESSION: [ActionType.CATCH, ActionType.DROP, 'score'],
    DEFENSE: [ActionType.BLOCK, ActionType.PICKUP, 'score'],
    DEFENSE_AFTER_BLOCK: [ActionType.PICKUP],
    AFTER_SCORE: [],
}

export const TEAM_ACTION_MAP: { [x: string]: ClientActionType[] } = {
    PREPOINT: [],
    OFFENSE: [
        ActionType.TIMEOUT,
        ActionType.CALL_ON_FIELD,
        ActionType.SUBSTITUTION,
    ],
    DEFENSE: ['score', ActionType.CALL_ON_FIELD, ActionType.SUBSTITUTION],
}
