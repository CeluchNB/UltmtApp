import { CheckBoxItem } from '../components/molecules/StatsFilterModal'
import { DisplayUser } from '../types/user'

export const getUserDisplayName = (player?: DisplayUser): string => {
    if (!player) {
        return ''
    }
    return `${player?.firstName} ${player?.lastName}`
}

export const getUniqueTeamIds = (player: {
    playerTeams: { _id: string }[]
    managerTeams: { _id: string }[]
    archiveTeams: { _id: string }[]
}): string[] => {
    const teams = [
        ...player.playerTeams.map(team => team._id),
        ...player.managerTeams.map(team => team._id),
        ...player.archiveTeams.map(team => team._id),
    ]
    return Array.from(new Set(teams))
}

export const getFilterButtonText = (
    filterType: string,
    filter: CheckBoxItem[],
): string => {
    const checkedItems = filter.filter(item => item.checked).length
    if (checkedItems === 0) {
        return `Filter by ${filterType}`
    }
    return `Filter by ${filterType} (${checkedItems})`
}

export const nameSort = (
    player1: DisplayUser,
    player2: DisplayUser,
): number => {
    return `${player1.firstName} ${player1.lastName}`
        .toLowerCase()
        .localeCompare(
            `${player2.firstName} ${player2.lastName}`.toLocaleLowerCase(),
        )
}
