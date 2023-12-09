import { CreateFullGame, Game, UpdateGame } from '../types/game'

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
