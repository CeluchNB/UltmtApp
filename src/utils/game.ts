import { DisplayUser } from '../types/user'
import { GameStats } from '../types/stats'
import { CreateFullGame, Game, PointStats, UpdateGame } from '../types/game'

export const parseFullGame = (game: Game): CreateFullGame => {
    return {
        creator: game.creator,
        teamOne: game.teamOne,
        teamTwo: game.teamTwo,
        teamTwoDefined: game.teamTwoDefined,
        scoreLimit: game.scoreLimit,
        halfScore: game.halfScore,
        startTime: game.startTime,
        softcapMins: game.softcapMins,
        hardcapMins: game.hardcapMins,
        playersPerPoint: game.playersPerPoint,
        timeoutPerHalf: game.timeoutPerHalf,
        floaterTimeout: game.floaterTimeout,
        tournament: game.tournament,
        teamOneScore: game.teamOneScore,
        teamTwoScore: game.teamTwoScore,
        teamOnePlayers: game.teamOnePlayers,
        points: [],
    }
}

export const parseUpdateGame = (data: UpdateGame): UpdateGame => {
    return {
        scoreLimit: Number(data.scoreLimit),
        halfScore: Number(data.halfScore),
        startTime: data.startTime,
        softcapMins: Number(data.softcapMins),
        hardcapMins: Number(data.hardcapMins),
        playersPerPoint: Number(data.playersPerPoint),
        timeoutPerHalf: Number(data.timeoutPerHalf),
        floaterTimeout: data.floaterTimeout,
    }
}

export const populateInGameStats = (
    game: GameStats,
    players: DisplayUser[],
): PointStats[] => {
    const playerMap = new Map<string, DisplayUser>()
    for (const player of players) {
        playerMap.set(player._id, player)
    }

    const pointStats = game.points.map(point => {
        return {
            _id: point._id,
            pointStats: point.players.map(player => {
                const playerData = playerMap.get(player._id)
                return {
                    _id: player._id,
                    firstName: playerData?.firstName ?? '',
                    lastName: playerData?.lastName ?? '',
                    username: playerData?.username ?? '',
                    pointsPlayed: player.pointsPlayed,
                    turnovers: player.drops + player.throwaways,
                    goals: player.goals,
                    assists: player.assists,
                    blocks: player.blocks,
                }
            }),
        }
    })
    return pointStats
}
