import { DisplayUser, User } from '../types/user'

export const getUserDisplayName = (player?: DisplayUser): string => {
    if (!player) {
        return ''
    }
    return `${player?.firstName} ${player?.lastName}`
}

export const getUniqueTeamIds = (player: {
    playerTeams: { _id: string }[]
    managerTeams: { _id: string }[]
}): string[] => {
    const teams = [
        ...player.playerTeams.map(team => team._id),
        ...player.managerTeams.map(team => team._id),
    ]
    return Array.from(new Set(teams))
}
