import { ActionType, ClientActionType } from '../types/action'

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
