import { CreateFullGame, Game } from '../types/game'

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
