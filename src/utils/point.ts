import { DisplayUser } from '../types/user'
import { TeamNumber } from '../types/team'
import { Action, ActionType, LiveServerActionData } from '../types/action'
import Point, { ClientPoint } from '../types/point'

export const isLivePoint = (point?: Point): boolean => {
    return point?.teamOneActive || point?.teamTwoActive || false
}

export const isPulling = (
    point?: { pullingTeam: { _id?: string } },
    game?: { teamOne: { _id: string } },
    team?: TeamNumber,
): boolean => {
    if (!point || !game || !team) {
        return false
    }
    if (team === 'one') {
        return point?.pullingTeam._id === game?.teamOne._id
    }
    return point?.pullingTeam._id !== game?.teamOne._id
}

export const isPullingNext = (
    team: TeamNumber,
    action?: ActionType,
): boolean => {
    return (
        (team === 'one' && action === ActionType.TEAM_ONE_SCORE) ||
        (team === 'two' && action === ActionType.TEAM_TWO_SCORE)
    )
}

export const normalizeActions = (
    teamOneActions: Action[],
    teamTwoActions: Action[],
): (Action | { ad: boolean })[] => {
    // dedupe actions
    const oneDeduped = [
        ...new Map(
            teamOneActions.map(action => [action.action.actionNumber, action]),
        ).values(),
    ].sort((a, b) => a.action.actionNumber - b.action.actionNumber)

    const twoDeduped = [
        ...new Map(
            teamTwoActions.map(action => [action.action.actionNumber, action]),
        ).values(),
    ].sort((a, b) => a.action.actionNumber - b.action.actionNumber)

    const result: (Action | { ad: boolean })[] = []
    const turnovers = [ActionType.DROP, ActionType.THROWAWAY]
    const initiating = [ActionType.CATCH, ActionType.PICKUP]
    let offense: string = 'one'

    // initiating action could be:
    // 1) Pull from either team
    // 2) Catch from either team
    // 3) Drop from either team
    // Order of the if/else VERY IMPORTANT
    if (
        oneDeduped.length > 0 &&
        oneDeduped[0].action.actionType === ActionType.PULL
    ) {
        result.push(oneDeduped.shift() as Action)
        offense = 'two'
    } else if (
        twoDeduped.length > 0 &&
        twoDeduped[0].action.actionType === ActionType.PULL
    ) {
        result.push(twoDeduped.shift() as Action)
        offense = 'one'
    } else if (
        oneDeduped.length > 0 &&
        oneDeduped[0].action.actionType === ActionType.DROP
    ) {
        result.push(oneDeduped.shift() as Action)
        offense = 'two'
    } else if (
        twoDeduped.length > 0 &&
        twoDeduped[0].action.actionType === ActionType.DROP
    ) {
        result.push(twoDeduped.shift() as Action)
        offense = 'one'
    } else if (
        twoDeduped.length === 0 &&
        oneDeduped.length > 0 &&
        initiating.includes(oneDeduped[0].action.actionType)
    ) {
        offense = 'one'
    } else if (
        oneDeduped.length === 0 &&
        twoDeduped.length > 0 &&
        initiating.includes(twoDeduped[0].action.actionType)
    ) {
        offense = 'two'
    }

    // alternate offense actions until we have no more actions
    while (oneDeduped.length > 0 || twoDeduped.length > 0) {
        if (offense === 'one' && oneDeduped.length > 0) {
            result.push(oneDeduped.shift() as Action)
            if (
                turnovers.includes(
                    (result[result.length - 1] as Action).action.actionType,
                )
            ) {
                result.push({ ad: true })
                offense = 'two'
            }
        } else if (offense === 'two' && twoDeduped.length > 0) {
            result.push(twoDeduped.shift() as Action)
            if (
                turnovers.includes(
                    (result[result.length - 1] as Action).action.actionType,
                )
            ) {
                result.push({ ad: true })
                offense = 'one'
            }
        } else if (offense === 'one' && oneDeduped.length === 0) {
            for (const action of twoDeduped) {
                if (
                    [
                        ActionType.BLOCK,
                        ActionType.DROP,
                        ActionType.THROWAWAY,
                    ].includes(action.action.actionType)
                ) {
                    result.push(action)
                    result.push({ ad: true })
                } else {
                    result.push(action)
                }
            }
            break
        } else {
            for (const action of oneDeduped) {
                if (
                    [
                        ActionType.BLOCK,
                        ActionType.DROP,
                        ActionType.THROWAWAY,
                    ].includes(action.action.actionType)
                ) {
                    result.push(action)
                    result.push({ ad: true })
                } else {
                    result.push(action)
                }
            }
            break
        }
    }

    // Remove 'the opposing team score' action from two-teamed games
    if (
        result.length > 1 &&
        lastTwoActionsAreScores(
            result[result.length - 1] as Action,
            result[result.length - 2] as Action,
        )
    ) {
        result.pop()
    }

    return result.reverse()
}

export const normalizeLiveActions = (
    liveActions: Action[],
): (Action | { ad: boolean })[] => {
    const teamOneActions = liveActions.filter(
        action => (action.action as LiveServerActionData).teamNumber === 'one',
    )
    const teamTwoActions = liveActions.filter(
        action => (action.action as LiveServerActionData).teamNumber === 'two',
    )

    return normalizeActions(teamOneActions, teamTwoActions)
}

const lastTwoActionsAreScores = (action1: Action, action2: Action): boolean => {
    return (
        Object.keys(action1).includes('action') &&
        Object.keys(action2).includes('action') &&
        (action1.action.actionType === ActionType.TEAM_ONE_SCORE ||
            action1.action.actionType === ActionType.TEAM_TWO_SCORE) &&
        action1.action.actionType === action2.action.actionType
    )
}

export const parseClientPoint = (point: Point): ClientPoint => {
    return {
        pointNumber: point.pointNumber,
        teamOnePlayers: point.teamOnePlayers,
        teamOneActivePlayers: point.teamOneActivePlayers,
        teamOneScore: point.teamOneScore,
        teamTwoScore: point.teamTwoScore,
        pullingTeam: point.pullingTeam,
        receivingTeam: point.receivingTeam,
        scoringTeam: point.scoringTeam,
        actions: [],
    }
}

export const substituteActivePlayer = (
    playerArray: DisplayUser[],
    playerToRemove: DisplayUser,
    playerToAdd: DisplayUser,
) => {
    const index = playerArray.findIndex(p => p._id === playerToRemove._id)
    if (index === -1) {
        return
    }
    playerArray.splice(index, 1, playerToAdd)
}

export const removePlayerFromArray = (
    playerArray: DisplayUser[],
    playerToRemove: DisplayUser,
) => {
    const index = playerArray.findIndex(p => p._id === playerToRemove._id)
    if (index === -1) {
        return
    }
    playerArray.splice(index, 1)
}
