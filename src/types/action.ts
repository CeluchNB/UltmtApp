import { DisplayUser } from './user'
import { getUserDisplayName } from '../utils/player'
import { DisplayTeam, TeamNumber } from './team'
import { isRetainingPossession, isScore, isTurnover } from '../utils/action'

export interface Action {
    action: ServerAction
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

export interface ActionListData {
    actionList: Action[]
}

export class PlayerActionListData implements ActionListData {
    actionList: Action[]
    constructor(
        playerOne: DisplayUser,
        actionStack: LiveServerAction[],
        team: TeamNumber,
        pulling: boolean,
    ) {
        this.actionList = getPlayerActionList(
            playerOne,
            actionStack,
            team,
            pulling,
        )
    }
}

export class TeamActionListData implements ActionListData {
    actionList: Action[]
    constructor(actionStack: LiveServerAction[], team: TeamNumber) {
        this.actionList = getTeamActionList(actionStack, team)
    }
}

const getPlayerActionList = (
    playerOne: DisplayUser,
    actionStack: LiveServerAction[],
    playerTeam: TeamNumber,
    pulling: boolean,
): Action[] => {
    let currentUser: string | undefined = playerOne._id
    for (const action of actionStack.slice().reverse()) {
        const playerTwo = action.playerOne
        switch (action.actionType) {
            case ActionType.PICKUP:
            case ActionType.CATCH:
                if (currentUser === action.playerOne?._id) {
                    return [new ThrowawayAction(playerOne)]
                } else {
                    return [
                        new CatchAction(playerOne, playerTwo),
                        new DropAction(playerOne, playerTwo),
                        new ScoreAction(
                            playerTeam,
                            'score',
                            playerOne,
                            playerTwo,
                        ),
                    ]
                }
            case ActionType.DROP:
            case ActionType.THROWAWAY:
            case ActionType.PULL:
                return [
                    new BlockAction(playerOne),
                    new PickupAction(playerOne),
                    new ScoreAction(playerTeam, 'clhn', playerOne, undefined),
                ]
            case ActionType.BLOCK:
                return [new PickupAction(playerOne)]
            case ActionType.TEAM_ONE_SCORE:
            case ActionType.TEAM_TWO_SCORE:
                return []
            case ActionType.TIMEOUT:
            case ActionType.CALL_ON_FIELD:
                continue
            case ActionType.SUBSTITUTION:
                // if we are getting actions for newly substituted user
                if (playerOne._id === action.playerTwo?._id) {
                    // inherit the actions from the player that was substituted for
                    currentUser = action.playerOne?._id
                }
                continue
        }
    }

    if (pulling) {
        return [new PullAction(playerOne)]
    }
    // first action on receiving team
    return [
        new CatchAction(playerOne),
        new PickupAction(playerOne),
        new DropAction(playerOne),
    ]
}

const getTeamActionList = (
    actionStack: LiveServerAction[],
    team: TeamNumber,
): Action[] => {
    for (const action of actionStack.slice().reverse()) {
        if (isRetainingPossession(action.actionType)) {
            return [
                new TimeoutAction(),
                new CallOnFieldAction(),
                new SubstitutionAction(),
            ]
        } else if (isTurnover(action.actionType)) {
            return [
                new ScoreAction(team === 'one' ? 'two' : 'one', 'they score'),
                new CallOnFieldAction(),
                new SubstitutionAction(),
            ]
        } else if (isScore(action.actionType)) {
            return []
        }
    }
    return []
}

class BaseAction implements Action {
    action: ServerAction
    reporterDisplay: string
    viewerDisplay: string

    constructor(
        action: Partial<ServerAction>,
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

    createFromAction(action: Partial<ServerAction>): Action {
        this.action = { ...this.action, ...action }
        return this
    }
}

class BlockAction extends BaseAction {
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

class CallOnFieldAction extends BaseAction {
    constructor() {
        super(
            { actionType: ActionType.CALL_ON_FIELD },
            'There is a call on the field',
            'call on field',
        )
    }
}

class CatchAction extends BaseAction {
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

class DropAction extends BaseAction {
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

class PickupAction extends BaseAction {
    constructor(playerOne: DisplayUser) {
        const playerOneDisplay = getUserDisplayName(playerOne)
        const viewerDisplay = `${playerOneDisplay} picks up the disc`
        super({ playerOne, actionType: ActionType.PICKUP }, viewerDisplay)
    }
}

class PullAction extends BaseAction {
    constructor(playerOne: DisplayUser) {
        const playerOneDisplay = getUserDisplayName(playerOne)
        const viewerDisplay = `${playerOneDisplay} pulls the disc`
        super({ playerOne, actionType: ActionType.PULL }, viewerDisplay)
    }
}

class SubstitutionAction extends BaseAction {
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

class ScoreAction extends BaseAction {
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
        console.log(
            'score action got displays',
            this.action.playerOne,
            this.action.playerTwo,
        )
        if (playerOneDisplay && playerTwoDisplay) {
            viewerDisplay = `${playerOneDisplay} scores from ${playerTwoDisplay}`
        } else if (playerOneDisplay) {
            // TODO: is callahan the only way to get here?
            viewerDisplay = `${playerOneDisplay} scores a callahan`
        } else {
            viewerDisplay = `The opposing team scores`
        }
        return viewerDisplay
    }
}

class ThrowawayAction extends BaseAction {
    constructor(playerOne: DisplayUser) {
        const playerOneDisplay = getUserDisplayName(playerOne)
        const viewerDisplay = `${playerOneDisplay} throws the disc away`
        super({ playerOne, actionType: ActionType.THROWAWAY }, viewerDisplay)
    }
}

class TimeoutAction extends BaseAction {
    constructor() {
        super({ actionType: ActionType.TIMEOUT }, 'Timeout called')
    }
}

export class ActionFactory {
    static createFromAction = (action: ServerAction): Action => {
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
        }
    }
}
