import {
    ActionType,
    ClientActionType,
    LiveServerAction,
    ServerAction,
} from '../types/action'

export const isPulling = (
    point?: { pullingTeam: { _id?: string } },
    game?: { teamOne: { _id: string } },
    team?: 'one' | 'two',
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
    team: 'one' | 'two',
    action?: ClientActionType,
): boolean => {
    return (
        (team === 'one' && action === ActionType.TEAM_ONE_SCORE) ||
        (team === 'two' && action === ActionType.TEAM_TWO_SCORE)
    )
}

export const normalizeActions = (
    teamOneActions: ServerAction[],
    teamTwoActions: ServerAction[],
): ServerAction[] => {
    // dedupe actions
    const oneDeduped = [
        ...new Map(
            teamOneActions.map(action => [action.actionNumber, action]),
        ).values(),
    ].sort((a, b) => a.actionNumber - b.actionNumber)

    const twoDeduped = [
        ...new Map(
            teamTwoActions.map(action => [action.actionNumber, action]),
        ).values(),
    ].sort((a, b) => a.actionNumber - b.actionNumber)

    // helper values
    const result: ServerAction[] = []
    const turnovers = [ActionType.DROP, ActionType.THROWAWAY]
    const initiating = [ActionType.CATCH, ActionType.PICKUP]
    let offense: string = 'one'

    // initiating action could be:
    // 1) Pull from either team
    // 2) Catch from either team
    // 3) Drop from either team
    // Order of the if/else VERY IMPORTANT
    if (oneDeduped.length > 0 && oneDeduped[0].actionType === ActionType.PULL) {
        result.push(oneDeduped.shift() as ServerAction)
        offense = 'two'
    } else if (
        twoDeduped.length > 0 &&
        twoDeduped[0].actionType === ActionType.PULL
    ) {
        result.push(twoDeduped.shift() as ServerAction)
        offense = 'one'
    } else if (
        oneDeduped.length > 0 &&
        oneDeduped[0].actionType === ActionType.DROP
    ) {
        result.push(oneDeduped.shift() as ServerAction)
        offense = 'two'
    } else if (
        twoDeduped.length > 0 &&
        twoDeduped[0].actionType === ActionType.DROP
    ) {
        result.push(twoDeduped.shift() as ServerAction)
        offense = 'one'
    } else if (
        twoDeduped.length === 0 &&
        oneDeduped.length > 0 &&
        initiating.includes(oneDeduped[0].actionType)
    ) {
        offense = 'one'
    } else if (
        oneDeduped.length === 0 &&
        twoDeduped.length > 0 &&
        initiating.includes(twoDeduped[0].actionType)
    ) {
        offense = 'two'
    }

    // alternate offense actions until we have no more actions
    while (oneDeduped.length > 0 || twoDeduped.length > 0) {
        if (offense === 'one' && oneDeduped.length > 0) {
            result.push(oneDeduped.shift() as ServerAction)
            if (turnovers.includes(result[result.length - 1].actionType)) {
                offense = 'two'
            }
        } else if (offense === 'two' && twoDeduped.length > 0) {
            result.push(twoDeduped.shift() as ServerAction)
            if (turnovers.includes(result[result.length - 1].actionType)) {
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

    return result
}

export const normalizeLiveActions = (
    liveActions: LiveServerAction[],
): ServerAction[] => {
    const teamOneActions = liveActions.filter(
        action => action.teamNumber === 'one',
    )
    const teamTwoActions = liveActions.filter(
        action => action.teamNumber === 'two',
    )

    return normalizeActions(teamOneActions, teamTwoActions)
}
