import { ActionType, LiveServerActionData } from '../types/action'
import { DisplayUser, InGameStatsUser } from '../types/user'

export const generatePlayerStatsForPoint = (
    players: DisplayUser[],
    actions: LiveServerActionData[],
): InGameStatsUser[] => {
    const map = new Map<string, InGameStatsUser>()
    for (const player of players) {
        if (!map.has(player._id)) {
            map.set(player._id, {
                _id: player._id,
                firstName: player.firstName,
                lastName: player.lastName,
                username: player.username,
                pointsPlayed: 1,
                goals: 0,
                assists: 0,
                turnovers: 0,
                blocks: 0,
            })
        }
    }

    for (const action of actions) {
        if (!action.playerOne) continue

        switch (action.actionType) {
            case ActionType.THROWAWAY:
                const throwawayPlayer = map.get(action.playerOne._id)
                if (throwawayPlayer) {
                    throwawayPlayer.turnovers += 1
                    map.set(throwawayPlayer._id, throwawayPlayer)
                }
                break
            case ActionType.DROP:
                const dropPlayer = map.get(action.playerOne._id)
                if (dropPlayer) {
                    dropPlayer.turnovers += 1
                    map.set(dropPlayer._id, dropPlayer)
                }
                break
            case ActionType.BLOCK:
                const blockPlayer = map.get(action.playerOne._id)
                if (blockPlayer) {
                    blockPlayer.blocks += 1
                    map.set(blockPlayer._id, blockPlayer)
                }
                break
            case ActionType.TEAM_ONE_SCORE:
            case ActionType.TEAM_TWO_SCORE:
                const goalPlayer = map.get(action.playerOne._id)
                if (goalPlayer) {
                    goalPlayer.goals += 1
                    map.set(goalPlayer._id, goalPlayer)
                }

                if (action.playerTwo) {
                    const assistPlayer = map.get(action.playerTwo._id)
                    if (assistPlayer) {
                        assistPlayer.assists += 1
                        map.set(assistPlayer._id, assistPlayer)
                    }
                }
                break
        }
    }

    return Array.from(map.values())
}

export const initializeInGameStatsPlayers = (
    players: DisplayUser[],
): InGameStatsUser[] => {
    return players.map(player => ({
        ...player,
        pointsPlayed: 0,
        goals: 0,
        assists: 0,
        turnovers: 0,
        blocks: 0,
    }))
}

export const updateInGameStatsPlayers = (
    currentPlayers: InGameStatsUser[],
    allPlayers: DisplayUser[],
): InGameStatsUser[] => {
    const map = initializeInGameStatsMap(currentPlayers)

    for (const player of allPlayers) {
        if (!map.has(player._id)) {
            map.set(player._id, {
                ...player,
                pointsPlayed: 0,
                goals: 0,
                assists: 0,
                turnovers: 0,
                blocks: 0,
            })
        }
    }

    return Array.from(map.values())
}

export const addInGameStatsPlayers = (
    allPlayers: InGameStatsUser[],
    updatedPlayers: InGameStatsUser[],
): InGameStatsUser[] => {
    const map = initializeInGameStatsMap(allPlayers)

    for (const player of updatedPlayers) {
        const currentPlayer = map.get(player._id)
        if (currentPlayer) {
            map.set(
                currentPlayer._id,
                addInGameStatsPlayerData(currentPlayer, player),
            )
        }
    }

    return Array.from(map.values())
}

export const subtractInGameStatsPlayers = (
    allPlayers: InGameStatsUser[],
    updatedPlayers: InGameStatsUser[],
): InGameStatsUser[] => {
    const map = initializeInGameStatsMap(allPlayers)

    for (const player of updatedPlayers) {
        const currentPlayer = map.get(player._id)
        if (currentPlayer) {
            map.set(
                currentPlayer._id,
                subtractInGameStatsPlayerData(currentPlayer, player),
            )
        }
    }

    return Array.from(map.values())
}

const initializeInGameStatsMap = (
    players: InGameStatsUser[],
): Map<string, InGameStatsUser> => {
    const map = new Map<string, InGameStatsUser>()
    for (const player of players) {
        if (!map.has(player._id)) {
            map.set(player._id, player)
        }
    }
    return map
}

const addInGameStatsPlayerData = (
    playerOne: InGameStatsUser,
    playerTwo: InGameStatsUser,
): InGameStatsUser => {
    return {
        _id: playerOne._id,
        firstName: playerOne.firstName,
        lastName: playerOne.lastName,
        username: playerOne.username,
        pointsPlayed: playerOne.pointsPlayed + playerTwo.pointsPlayed,
        goals: playerOne.goals + playerTwo.goals,
        assists: playerOne.assists + playerTwo.assists,
        blocks: playerOne.blocks + playerTwo.blocks,
        turnovers: playerOne.turnovers + playerTwo.turnovers,
    }
}

const subtractInGameStatsPlayerData = (
    playerOne: InGameStatsUser,
    playerTwo: InGameStatsUser,
): InGameStatsUser => {
    return {
        _id: playerOne._id,
        firstName: playerOne.firstName,
        lastName: playerOne.lastName,
        username: playerOne.username,
        pointsPlayed: playerOne.pointsPlayed - playerTwo.pointsPlayed,
        goals: playerOne.goals - playerTwo.goals,
        assists: playerOne.assists - playerTwo.assists,
        blocks: playerOne.blocks - playerTwo.blocks,
        turnovers: playerOne.turnovers - playerTwo.turnovers,
    }
}
