import { DisplayUser } from '../types/user'
import { TeamNumber } from '../types/team'
import {
    Action,
    ActionType,
    BlockAction,
    CallOnFieldAction,
    CatchAction,
    ClientActionData,
    DropAction,
    PickupAction,
    PullAction,
    ScoreAction,
    ServerActionData,
    StallAction,
    SubstitutionAction,
    ThrowawayAction,
    TimeoutAction,
} from '../types/action'

export const parseClientAction = (
    action: ServerActionData,
): ClientActionData => {
    return {
        tags: action.tags,
        playerOne: action.playerOne,
        playerTwo: action.playerTwo,
        actionType: action.actionType,
    }
}

const isScore = (type: ActionType): boolean => {
    return [ActionType.TEAM_ONE_SCORE, ActionType.TEAM_TWO_SCORE].includes(type)
}

const isTurnover = (type: ActionType): boolean => {
    return [
        ActionType.PULL,
        ActionType.DROP,
        ActionType.THROWAWAY,
        ActionType.STALL,
    ].includes(type)
}

const isRetainingPossession = (type: ActionType): boolean => {
    return [ActionType.BLOCK, ActionType.PICKUP, ActionType.CATCH].includes(
        type,
    )
}

export const getPlayerActionList = (
    playerOne: DisplayUser,
    actionStack: ServerActionData[],
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
                    return [
                        new ThrowawayAction(playerOne),
                        new StallAction(playerOne),
                    ]
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
            case ActionType.STALL:
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

    return [
        new CatchAction(playerOne),
        new PickupAction(playerOne),
        new DropAction(playerOne),
    ]
}

export const getTeamActionList = (
    actionStack: ServerActionData[],
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
                new ScoreAction(getOppositeTeam(team), 'they score'),
                new CallOnFieldAction(),
                new SubstitutionAction(),
            ]
        } else if (isScore(action.actionType)) {
            return []
        }
    }
    return []
}

const getOppositeTeam = (team: TeamNumber): TeamNumber => {
    return team === 'one' ? 'two' : 'one'
}
