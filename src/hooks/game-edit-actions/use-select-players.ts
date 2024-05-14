import { DisplayUser } from '../../types/user'
import { useState } from 'react'

export const useSelectPlayers = () => {
    const [selectedPlayers, setSelectedPlayers] = useState<DisplayUser[]>([])

    const toggleSelection = (player: DisplayUser) => {
        if (selectedPlayers.map(p => p._id).includes(player._id)) {
            setSelectedPlayers(prev => {
                return prev.filter(s => s._id !== player._id)
            })
        } else {
            setSelectedPlayers(prev => {
                return [player, ...prev]
            })
        }
    }

    return { selectedPlayers, toggleSelection }
}
