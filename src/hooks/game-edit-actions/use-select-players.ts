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

const mapLines = (
    lines: LineSchema[],
    selected: (line: LineSchema) => boolean,
) => {
    const map: { [x: string]: { line: LineSchema; selected: boolean } } = {}

    for (const line of lines) {
        if (!line._id) continue

        map[line._id.toHexString()] = { line, selected: selected(line) }
    }
    return map
}

export const useSelectPlayers = (
    gameId: string,
    players: InGameStatsUser[],
) => {
    const lines = useQuery<LineSchema>('Line').filtered(`gameId == '${gameId}'`)

    const [lineOptions, setLineOptions] = useState(
        mapLines(lines.slice(), () => false),
    )

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

    const toggleLine = (lineId: string) => {
        // if a line is selected, all players on the line are selected
        // if players are already selected, the line players are added
        // if a second line is selected, the line players are added
        // in all cases above, duplicate players are selected
        // if a line is deselected, players on this line that are not on any other selected lines are deselected

        // other

        const line = lineOptions[lineId]

        setLineOptions(curr =>
            mapLines(
                Object.values(curr).map(l => l.line),
                l => {
                    if (!l._id) return false

                    if (l._id.toHexString() === lineId) {
                        // toggle selected line
                        return !curr[lineId].selected
                    } else {
                        // keep all other lines the same
                        return curr[l._id.toHexString()].selected
                    }
                },
            ),
        )

        const selected = (player: InGameStatsUser) => {
            return (
                line.line.players.findIndex(p => p._id === player._id) > -1 ||
                playerOptions[player._id].selected
            )
        }

        setPlayerOptions(mapPlayers(players, selected))
    }

    const clearSelection = () => {
        setPlayerOptions(mapPlayers(players, () => false))
    }

    return {
        lines,
        playerOptions,
        toggleLine,
        toggleSelection,
        clearSelection,
    }
}
