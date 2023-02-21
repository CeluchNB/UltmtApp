import { DisplayUser } from './user'
import { getUserDisplayName } from '../utils/player'
import { DisplayTeam, TeamNumber } from './team'

export interface Action {
    action: ServerAction
    reporterDisplay: string
    viewerDisplay: string
    setTags(tags: string[]): void
    setPlayers(playerOne?: DisplayUser, playerTwo?: DisplayUser): void
}

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
    [x in SubscriptionType]: (data: any) => Promise<void> | void
}

export interface ClientAction {
    actionType: ActionType
    playerOne?: DisplayUser
    playerTwo?: DisplayUser
    tags: string[]
}

export interface Comment {
    user: DisplayUser
    comment: string
    commentNumber: number
}

export interface ServerAction extends ClientAction {
    comments: Comment[]
    actionNumber: number
}

export interface LiveServerAction extends ServerAction {
    teamNumber: TeamNumber
}

export interface SavedServerAction extends ServerAction {
    _id: string
    team: DisplayTeam
}

export const ACTION_MAP: { [x: string]: ActionType[] } = {
    PULLING: [ActionType.PULL],
    RECEIVING: [ActionType.CATCH, ActionType.PICKUP, ActionType.DROP],
    OFFENSE_WITH_POSSESSION: [ActionType.THROWAWAY],
    OFFENSE_NO_POSSESSION: [ActionType.CATCH, ActionType.DROP, 'score'],
    DEFENSE: [ActionType.BLOCK, ActionType.PICKUP, 'score'],
    DEFENSE_AFTER_BLOCK: [ActionType.PICKUP],
    AFTER_SCORE: [],
}

export const TEAM_ACTION_MAP: { [x: string]: ActionType[] } = {
    PREPOINT: [],
    OFFENSE: [
        ActionType.TIMEOUT,
        ActionType.CALL_ON_FIELD,
        ActionType.SUBSTITUTION,
    ],
    DEFENSE: ['score', ActionType.CALL_ON_FIELD, ActionType.SUBSTITUTION],
}

class BaseAction implements Action {
    action: ServerAction
    reporterDisplay: string
    viewerDisplay: string

    constructor(action: ServerAction, viewerDisplay: string) {
        this.action = action
        this.reporterDisplay = action.actionType
        this.viewerDisplay = viewerDisplay
    }

    setTags(tags: string[]): void {
        this.action.tags = tags
    }

    setPlayers(playerOne?: DisplayUser, playerTwo?: DisplayUser): void {
        this.action.playerOne = playerOne
        this.action.playerTwo = playerTwo
    }
}

const createAction = (action: ClientAction): Action => {
    let viewerDisplay = ''
    const playerOneDisplay = getUserDisplayName(action.playerOne)
    const playerTwoDisplay = getUserDisplayName(action.playerTwo)
    switch (action.actionType) {
        case ActionType.BLOCK:
            viewerDisplay = `${getUserDisplayName(
                action.playerOne,
            )} gets a block`
            break
        case ActionType.CALL_ON_FIELD:
            viewerDisplay = 'There is a call on the field'
            break
        case ActionType.CATCH:
            viewerDisplay = `${playerOneDisplay} catches a pass from ${playerTwoDisplay}`
            break
        case ActionType.DROP:
            viewerDisplay = `${playerOneDisplay} drops the disc`
            break
        case ActionType.PICKUP:
            viewerDisplay = `${playerOneDisplay} picks up the disc`
            break
        case ActionType.PULL:
            viewerDisplay = `${playerOneDisplay} pulls the disc`
            break
        case ActionType.SUBSTITUTION:
            viewerDisplay = `${playerTwoDisplay} replaces ${playerOneDisplay}`
            break
        case ActionType.TEAM_ONE_SCORE:
        case ActionType.TEAM_TWO_SCORE:
            break
        case ActionType.THROWAWAY:
            viewerDisplay = `${playerOneDisplay} throws away the disc`
            break
        case ActionType.TIMEOUT:
            viewerDisplay = 'Timeout called'
            break
    }
    return new BaseAction(
        { ...action, comments: [], actionNumber: Infinity },
        viewerDisplay,
    )
}
