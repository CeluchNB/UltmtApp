import { InGameStatsUser } from '../../types/user'
import { useState } from 'react'

export const useSelectPlayers = () => {
    const [selectedPlayers, setSelectedPlayers] = useState<InGameStatsUser[]>(
        [],
    )

    const toggleSelection = (player: InGameStatsUser) => {
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

    const clearSelection = () => {
        setSelectedPlayers([])
    }

    return { selectedPlayers, toggleSelection, clearSelection }
}
