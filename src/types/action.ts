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

export type SubType = 'client' | 'undo' | 'error'
export type SubscriptionObject = {
    [x in SubType]: (data: any) => void
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
    teamNumber: 'one' | 'two'
}

export const ACTION_MAP: { [x: string]: (ActionType | 'score')[] } = {
    PULLING: [ActionType.PULL],
    RECEIVING: [ActionType.CATCH, ActionType.PICKUP, ActionType.DROP],
    OFFENSE_WITH_POSSESSION: [ActionType.THROWAWAY],
    OFFENSE_NO_POSSESSION: [ActionType.CATCH, ActionType.DROP, 'score'],
    DEFENSE: [ActionType.BLOCK, ActionType.PICKUP, 'score'],
    DEFENSE_AFTER_BLOCK: [ActionType.PICKUP],
}