import { DisplayUser } from './user'
import { getUserDisplayName } from '../utils/player'
import { DisplayTeam, TeamNumber } from './team'
import { getPlayerActionList, getTeamActionList } from '../utils/action'

export interface Action {
    action: ServerActionData
    reporterDisplay: string
    viewerDisplay: string
    setTags(tags: string[]): void
    setPlayersAndUpdateViewerDisplay(
        playerOne?: DisplayUser,
        playerTwo?: DisplayUser,
    ): void
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
    STALL = 'Stall',
}

export type SubscriptionType = 'client' | 'undo' | 'error' | 'point'
export type SubscriptionObject = {
    [x in SubscriptionType]: (data: any) => Promise<void> | void
}

export interface ClientActionData {
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

export interface ServerActionData extends ClientActionData {
    comments: Comment[]
    actionNumber: number
}

export interface LiveServerActionData extends ServerActionData {
    teamNumber: TeamNumber
}

export interface SavedServerActionData extends ServerActionData {
    _id: string
    team: DisplayTeam
}

export interface ActionList {
    actionList: Action[]
}

export class PlayerActionList implements ActionList {
    actionList: Action[]
    constructor(
        playerOne: DisplayUser,
        actionStack: LiveServerActionData[],
        team: TeamNumber,
        pulling: boolean,
    ) {
        // const actions = actionStack.map(action => action.action)
        this.actionList = getPlayerActionList(
            playerOne,
            actionStack,
            team,
            pulling,
        )
    }
}

export class TeamActionList implements ActionList {
    actionList: Action[]
    constructor(actions: LiveServerActionData[], team: TeamNumber) {
        // const actions = actionStack.map(action => action.action)
        this.actionList = getTeamActionList(actions, team)
    }
}

class BaseAction implements Action {
    action: ServerActionData
    reporterDisplay: string
    viewerDisplay: string

    constructor(
        action: Partial<ServerActionData>,
        viewerDisplay: string,
        reporterDisplay?: string,
    ) {
        this.action = {
            actionNumber: Infinity,
            actionType: ActionType.PULL,
            tags: [],
            comments: [],
            ...action,
        }
        this.reporterDisplay = reporterDisplay ?? this.action.actionType
        this.viewerDisplay = viewerDisplay
    }

    setTags(tags: string[]): void {
        this.action.tags = tags
    }

    setPlayersAndUpdateViewerDisplay(
        playerOne?: DisplayUser,
        playerTwo?: DisplayUser,
    ): void {
        this.action.playerOne = playerOne
        this.action.playerTwo = playerTwo
    }

    setPlayers(playerOne?: DisplayUser, playerTwo?: DisplayUser) {
        this.action.playerOne = playerOne
        this.action.playerTwo = playerTwo
    }

    createFromAction(action: Partial<ServerActionData>): Action {
        this.action = { ...this.action, ...action }
        return this
    }
}

export class BlockAction extends BaseAction {
    constructor(playerOne: DisplayUser) {
        const playerOneDisplay = getUserDisplayName(playerOne)
        const viewerDisplay = `${playerOneDisplay} blocks the throw`
        super(
            {
                playerOne,
                actionType: ActionType.BLOCK,
            },
            viewerDisplay,
        )
    }
}

export class CallOnFieldAction extends BaseAction {
    constructor() {
        super(
            { actionType: ActionType.CALL_ON_FIELD },
            'There is a call on the field',
            'call on field',
        )
    }
}

export class CatchAction extends BaseAction {
    constructor(playerOne: DisplayUser, playerTwo?: DisplayUser) {
        super({ actionType: ActionType.CATCH }, 'Catch')
        this.setPlayersAndUpdateViewerDisplay(playerOne, playerTwo)
    }

    setPlayersAndUpdateViewerDisplay(
        playerOne?: DisplayUser,
        playerTwo?: DisplayUser,
    ) {
        this.setPlayers(playerOne, playerTwo)
        this.viewerDisplay = this.getViewerDisplay()
    }

    getViewerDisplay(): string {
        const playerOneDisplay = getUserDisplayName(this.action.playerOne)
        let viewerDisplay = `${playerOneDisplay} catches the disc`
        if (this.action.playerTwo) {
            const playerTwoDisplay = getUserDisplayName(this.action.playerTwo)
            viewerDisplay = viewerDisplay.concat(` from ${playerTwoDisplay}`)
        }
        return viewerDisplay
    }
}

export class DropAction extends BaseAction {
    constructor(playerOne: DisplayUser, playerTwo?: DisplayUser) {
        super({ actionType: ActionType.DROP }, 'Drop')
        this.setPlayersAndUpdateViewerDisplay(playerOne, playerTwo)
    }

    setPlayersAndUpdateViewerDisplay(
        playerOne?: DisplayUser,
        playerTwo?: DisplayUser,
    ) {
        this.setPlayers(playerOne, playerTwo)
        this.viewerDisplay = this.getViewerDisplay()
    }

    getViewerDisplay(): string {
        const playerOneDisplay = getUserDisplayName(this.action.playerOne)
        let viewerDisplay = `${playerOneDisplay} drops the pass`
        if (this.action.playerTwo) {
            const playerTwoDisplay = getUserDisplayName(this.action.playerTwo)
            viewerDisplay = viewerDisplay.concat(` from ${playerTwoDisplay}`)
        }
        return viewerDisplay
    }
}

export class PickupAction extends BaseAction {
    constructor(playerOne: DisplayUser) {
        const playerOneDisplay = getUserDisplayName(playerOne)
        const viewerDisplay = `${playerOneDisplay} picks up the disc`
        super({ playerOne, actionType: ActionType.PICKUP }, viewerDisplay)
    }
}

export class PullAction extends BaseAction {
    constructor(playerOne: DisplayUser) {
        const playerOneDisplay = getUserDisplayName(playerOne)
        const viewerDisplay = `${playerOneDisplay} pulls the disc`
        super({ playerOne, actionType: ActionType.PULL }, viewerDisplay)
    }
}

export class SubstitutionAction extends BaseAction {
    constructor(playerOne?: DisplayUser, playerTwo?: DisplayUser) {
        super({ actionType: ActionType.SUBSTITUTION }, 'substitution')
        this.setPlayersAndUpdateViewerDisplay(playerOne, playerTwo)
    }

    setPlayersAndUpdateViewerDisplay(
        playerOne?: DisplayUser,
        playerTwo?: DisplayUser,
    ) {
        this.action.playerOne = playerOne
        this.action.playerTwo = playerTwo
        if (playerOne && playerTwo) {
            const playerOneDisplay = getUserDisplayName(playerOne)
            const playerTwoDisplay = getUserDisplayName(playerTwo)
            this.viewerDisplay = `${playerTwoDisplay} replaces ${playerOneDisplay}`
        }
    }
}

export class ScoreAction extends BaseAction {
    constructor(
        team: TeamNumber,
        reporterDisplay?: string,
        playerOne?: DisplayUser,
        playerTwo?: DisplayUser,
    ) {
        const actionType =
            team === 'one'
                ? ActionType.TEAM_ONE_SCORE
                : ActionType.TEAM_TWO_SCORE
        super({ actionType }, 'score', reporterDisplay)
        this.setPlayersAndUpdateViewerDisplay(playerOne, playerTwo)
    }

    setPlayersAndUpdateViewerDisplay(
        playerOne?: DisplayUser,
        playerTwo?: DisplayUser,
    ) {
        this.setPlayers(playerOne, playerTwo)
        this.viewerDisplay = this.getViewerDisplay()
    }

    getViewerDisplay() {
        let viewerDisplay = ''
        const playerOneDisplay = getUserDisplayName(this.action.playerOne)
        const playerTwoDisplay = getUserDisplayName(this.action.playerTwo)
        if (playerOneDisplay && playerTwoDisplay) {
            viewerDisplay = `${playerOneDisplay} scores from ${playerTwoDisplay}`
        } else if (playerOneDisplay) {
            viewerDisplay = `${playerOneDisplay} scores a callahan`
        } else {
            viewerDisplay = `The opposing team scores`
        }
        return viewerDisplay
    }
}

export class ThrowawayAction extends BaseAction {
    constructor(playerOne: DisplayUser) {
        const playerOneDisplay = getUserDisplayName(playerOne)
        const viewerDisplay = `${playerOneDisplay} throws the disc away`
        super({ playerOne, actionType: ActionType.THROWAWAY }, viewerDisplay)
    }
}

export class TimeoutAction extends BaseAction {
    constructor() {
        super({ actionType: ActionType.TIMEOUT }, 'Timeout called')
    }
}

export class StallAction extends BaseAction {
    constructor(playerOne?: DisplayUser) {
        const playerOneDisplay = getUserDisplayName(playerOne)
        const viewerDisplay = `${playerOneDisplay} is stalled out`
        super({ playerOne, actionType: ActionType.STALL }, viewerDisplay)
    }
}

export class ActionFactory {
    static createFromAction = (action: ServerActionData): Action => {
        switch (action.actionType) {
            case ActionType.BLOCK:
                return new BlockAction(action.playerOne!).createFromAction(
                    action,
                )
            case ActionType.CALL_ON_FIELD:
                return new CallOnFieldAction().createFromAction(action)
            case ActionType.CATCH:
                return new CatchAction(
                    action.playerOne!,
                    action.playerTwo,
                ).createFromAction(action)
            case ActionType.DROP:
                return new DropAction(
                    action.playerOne!,
                    action.playerTwo,
                ).createFromAction(action)
            case ActionType.PICKUP:
                return new PickupAction(action.playerOne!).createFromAction(
                    action,
                )
            case ActionType.PULL:
                return new PullAction(action.playerOne!).createFromAction(
                    action,
                )
            case ActionType.SUBSTITUTION:
                return new SubstitutionAction(
                    action.playerOne,
                    action.playerTwo,
                ).createFromAction(action)
            case ActionType.TEAM_ONE_SCORE:
            case ActionType.TEAM_TWO_SCORE:
                const scoreAction = new ScoreAction('one').createFromAction(
                    action,
                )
                scoreAction.setPlayersAndUpdateViewerDisplay(
                    action.playerOne,
                    action.playerTwo,
                )
                return scoreAction
            case ActionType.THROWAWAY:
                return new ThrowawayAction(action.playerOne!).createFromAction(
                    action,
                )
            case ActionType.TIMEOUT:
                return new TimeoutAction().createFromAction(action)
            case ActionType.STALL:
                return new StallAction(action.playerOne).createFromAction(
                    action,
                )
        }
    }
}
