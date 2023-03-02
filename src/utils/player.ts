import { DisplayUser } from '../types/user'

export const getUserDisplayName = (player?: DisplayUser): string => {
    if (!player) {
        return ''
    }
    return `${player?.firstName} ${player?.lastName}`
}
