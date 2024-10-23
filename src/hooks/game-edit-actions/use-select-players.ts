import { LineSchema } from '@ultmt-app/models'
import { useQuery } from '@ultmt-app/context/realm'
import { useState } from 'react'
import { DisplayUser, InGameStatsUser } from '../../types/user'

const mapPlayers = (
    players: InGameStatsUser[],
    selected: (player: InGameStatsUser) => boolean,
) => {
    const map: { [x: string]: { player: InGameStatsUser; selected: boolean } } =
        {}
    for (const player of players) {
        map[player._id] = { player, selected: selected(player) }
    }
    return map
}

export const useSelectPlayers = (
    gameId: string,
    players: InGameStatsUser[],
) => {
    const lines = useQuery<LineSchema>('Line').filtered(`gameId == '${gameId}'`)

    const [playerOptions, setPlayerOptions] = useState<{
        [x: string]: { player: InGameStatsUser; selected: boolean }
    }>(mapPlayers(players, () => false))

    const toggleSelection = (player: DisplayUser) => {
        setPlayerOptions(curr => ({
            ...curr,
            [player._id]: {
                ...curr[player._id],
                selected: !curr[player._id].selected,
            },
        }))
    }

    const selectLine = (lineId: string) => {
        const line = lines.find(l => l._id?.toHexString() === lineId)
        if (!line) return

        setPlayerOptions(
            mapPlayers(
                players,
                player =>
                    line.players.findIndex(p => p._id === player._id) > -1 ||
                    playerOptions[player._id].selected,
            ),
        )
    }

    const clearSelection = () => {
        setPlayerOptions(mapPlayers(players, () => false))
    }

    return { lines, playerOptions, selectLine, toggleSelection, clearSelection }
}
