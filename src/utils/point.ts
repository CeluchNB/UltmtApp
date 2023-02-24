import { TeamNumber } from '../types/team'
import { Action, ActionType, LiveServerAction } from '../types/action'
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
): Action[] => {
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

    // helper values
    const result: Action[] = []
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
                turnovers.includes(result[result.length - 1].action.actionType)
            ) {
                offense = 'two'
            }
        } else if (offense === 'two' && twoDeduped.length > 0) {
            result.push(twoDeduped.shift() as Action)
            if (
                turnovers.includes(result[result.length - 1].action.actionType)
            ) {
                offense = 'one'
            }
        } else if (offense === 'one' && oneDeduped.length === 0) {
            result.push(...twoDeduped)
            break
        } else {
            result.push(...oneDeduped)
            break
        }
    }

    return result.reverse()
}

export const normalizeLiveActions = (liveActions: Action[]): Action[] => {
    const teamOneActions = liveActions.filter(
        action => (action.action as LiveServerAction).teamNumber === 'one',
    )
    const teamTwoActions = liveActions.filter(
        action => (action.action as LiveServerAction).teamNumber === 'two',
    )

    return normalizeActions(teamOneActions, teamTwoActions)
}

export const parseClientPoint = (point: Point): ClientPoint => {
    return {
        pointNumber: point.pointNumber,
        teamOnePlayers: point.teamOnePlayers,
        teamOneScore: point.teamOneScore,
        teamTwoScore: point.teamTwoScore,
        pullingTeam: point.pullingTeam,
        receivingTeam: point.receivingTeam,
        scoringTeam: point.scoringTeam,
        actions: [],
    }
}
