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
    const realmLines = useQuery<LineSchema>('Line').filtered(
        `gameId == '${gameId}'`,
    )

    const [lineOptions, setLineOptions] = useState(
        mapLines(
            realmLines.map(l => ({ ...new LineSchema(l), _id: l._id })),
            () => false,
        ),
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
        const lineOption = lineOptions[lineId]
        if (!lineOption) return

        const lineSelectedPlayers: DisplayUser[] = Object.values(lineOptions)
            .filter(o => o.selected && o.line._id?.toHexString() !== lineId)
            .reduce<DisplayUser[]>((current, next) => {
                return [...current, ...next.line.players]
            }, [])

        const selected = (player: InGameStatsUser) => {
            if (lineOption.selected) {
                // if we are deselecting the line
                if (
                    lineOption.line.players.findIndex(
                        p => p._id === player._id,
                    ) > -1
                ) {
                    // if player is on the line
                    if (
                        lineSelectedPlayers.findIndex(
                            p => p._id === player._id,
                        ) > -1
                    ) {
                        // if player is on any other selected lines
                        return playerOptions[player._id].selected
                    } else {
                        // if player is not on any other selected lines
                        return false
                    }
                } else {
                    // if player is not on the line
                    // then retain current selection
                    return playerOptions[player._id].selected
                }
            } else {
                // if we are selecting the line
                // any player on the line is selected
                if (
                    lineOption.line.players.findIndex(
                        p => p._id === player._id,
                    ) > -1
                ) {
                    return true
                } else {
                    return playerOptions[player._id].selected
                }
            }
        }

        setPlayerOptions(mapPlayers(players, selected))

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
    }

    const clearSelection = () => {
        setPlayerOptions(mapPlayers(players, () => false))
    }

    const refreshLines = () => {
        setLineOptions(
            mapLines(
                realmLines.map(l => ({ ...new LineSchema(l), _id: l._id })),
                () => false,
            ),
        )
    }

    return {
        lineOptions,
        playerOptions,
        toggleLine,
        toggleSelection,
        clearSelection,
        refreshLines,
    }
}
