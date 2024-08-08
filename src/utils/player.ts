import { CheckBoxItem } from '../components/molecules/StatsFilterModal'
import { DisplayUser } from '../types/user'
import { LocalUser } from '../types/team'
import { Realm } from '@realm/react'

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

export const generateGuestData = (firstName: string, lastName: string) => {
    return {
        _id: new Realm.BSON.ObjectID().toHexString(),
        firstName,
        lastName,
        username: `guest${Date.now()}`,
        localGuest: true,
    }
}

export const createPlayerSet = (
    players1: LocalUser[],
    players2: LocalUser[],
): LocalUser[] => {
    const players = [...players1]
    players2.forEach(p1 =>
        players.findIndex(p2 => p1._id === p2._id) === -1
            ? players.push(p1)
            : null,
    )
    return players.map(p => ({
        _id: p._id,
        firstName: p.firstName,
        lastName: p.lastName,
        username: p.username,
        localGuest: p.localGuest,
    }))
}

export const parseUser = (user: DisplayUser): DisplayUser => {
    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
    }
}
