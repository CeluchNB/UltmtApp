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

// export const ACTION_MAP: { [x: string]: ActionType[] } = {
//     PULLING: [ActionType.PULL],
//     RECEIVING: [ActionType.CATCH, ActionType.PICKUP, ActionType.DROP],
//     OFFENSE_WITH_POSSESSION: [ActionType.THROWAWAY],
//     OFFENSE_NO_POSSESSION: [ActionType.CATCH, ActionType.DROP, 'score'],
//     DEFENSE: [ActionType.BLOCK, ActionType.PICKUP, 'score'],
//     DEFENSE_AFTER_BLOCK: [ActionType.PICKUP],
//     AFTER_SCORE: [],
// }

// export const TEAM_ACTION_MAP: { [x: string]: ActionType[] } = {
//     PREPOINT: [],
//     OFFENSE: [
//         ActionType.TIMEOUT,
//         ActionType.CALL_ON_FIELD,
//         ActionType.SUBSTITUTION,
//     ],
//     DEFENSE: ['score', ActionType.CALL_ON_FIELD, ActionType.SUBSTITUTION],
// }

export interface ActionListData {
    actionList: Action[]
}

export class PlayerActionListData {
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

export class TeamActionListData {
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
    const initialAction: ClientAction = {
        playerOne,
        actionType: ActionType.PULL,
        tags: [],
    }
    const score =
        playerTeam === 'one'
            ? ActionType.TEAM_ONE_SCORE
            : ActionType.TEAM_TWO_SCORE
    for (const action of actionStack.slice().reverse()) {
        const playerTwo = action.playerOne
        switch (action.actionType) {
            case ActionType.PICKUP:
            case ActionType.CATCH:
                if (currentUser === action.playerOne?._id) {
                    return [
                        createAction({
                            ...initialAction,
                            actionType: ActionType.THROWAWAY,
                        }),
                    ]
                } else {
                    return [
                        createAction({
                            ...initialAction,
                            playerTwo,
                            actionType: ActionType.CATCH,
                        }),
                        createAction({
                            ...initialAction,
                            playerTwo,
                            actionType: ActionType.DROP,
                        }),
                        createAction(
                            {
                                ...initialAction,
                                playerTwo,
                                actionType: score,
                            },
                            'score',
                        ),
                    ]
                }
            case ActionType.DROP:
            case ActionType.THROWAWAY:
            case ActionType.PULL:
                return [
                    createAction({
                        ...initialAction,
                        actionType: ActionType.BLOCK,
                    }),
                    createAction({
                        ...initialAction,
                        actionType: ActionType.PICKUP,
                    }),
                    createAction(
                        {
                            ...initialAction,
                            actionType: score,
                        },
                        'clhn',
                    ),
                ]
            case ActionType.BLOCK:
                return [
                    createAction({
                        ...initialAction,
                        actionType: ActionType.PICKUP,
                    }),
                ]
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
        return [
            createAction({ playerOne, actionType: ActionType.PULL, tags: [] }),
        ]
    }
    return [
        createAction({ playerOne, actionType: ActionType.CATCH, tags: [] }),
        createAction({ playerOne, actionType: ActionType.PICKUP, tags: [] }),
        createAction({ playerOne, actionType: ActionType.DROP, tags: [] }),
    ]
}

const getTeamActionList = (
    actionStack: LiveServerAction[],
    team: TeamNumber,
): Action[] => {
    for (const action of actionStack.slice().reverse()) {
        if (
            [ActionType.BLOCK, ActionType.PICKUP, ActionType.CATCH].includes(
                action.actionType,
            )
        ) {
            return [
                createAction({
                    actionType: ActionType.TIMEOUT,
                    tags: [],
                }),
                createAction(
                    {
                        actionType: ActionType.CALL_ON_FIELD,
                        tags: [],
                    },
                    'call on field',
                ),
                createAction({
                    actionType: ActionType.SUBSTITUTION,
                    tags: [],
                }),
            ]
        } else if (
            [ActionType.PULL, ActionType.DROP, ActionType.THROWAWAY].includes(
                action.actionType,
            )
        ) {
            const scoreAction =
                team === 'one'
                    ? ActionType.TEAM_TWO_SCORE
                    : ActionType.TEAM_ONE_SCORE
            return [
                createAction(
                    {
                        actionType: scoreAction,
                        tags: [],
                    },
                    'they score',
                ),
                createAction(
                    {
                        actionType: ActionType.CALL_ON_FIELD,
                        tags: [],
                    },
                    'call on field',
                ),
                createAction({
                    actionType: ActionType.SUBSTITUTION,
                    tags: [],
                }),
            ]
        } else if (
            [ActionType.TEAM_ONE_SCORE, ActionType.TEAM_TWO_SCORE].includes(
                action.actionType,
            )
        ) {
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
        action: ServerAction,
        viewerDisplay: string,
        reporterDisplay?: string,
    ) {
        this.action = action
        this.reporterDisplay = reporterDisplay ?? action.actionType
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

const createAction = (
    action: ClientAction,
    reporterDisplay?: string,
): Action => {
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
            viewerDisplay = `${playerOneDisplay} catches the disc`
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
        reporterDisplay,
    )
}
