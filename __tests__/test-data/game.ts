import { DisplayTeamFactory } from './team'
import { Factory } from 'fishery'
import { GameStats } from '../../src/types/stats'
import { faker } from '@faker-js/faker'
import { DisplayUserFactory, InGameStatsUserFactory } from './user'
import { Game, GameStatus } from '../../src/types/game'

export const GameFactory = Factory.define<Game>(() => ({
    _id: faker.database.mongodbObjectId(),
    creator: DisplayUserFactory.build(),
    teamOne: DisplayTeamFactory.build(),
    teamTwo: DisplayTeamFactory.build(),
    teamTwoDefined: true,
    scoreLimit: faker.number.int({ min: 7, max: 15 }),
    halfScore: faker.number.int({ min: 4, max: 7 }),
    startTime: faker.date.future(),
    softcapMins: faker.number.int({ min: 45, max: 75 }),
    hardcapMins: faker.number.int({ min: 60, max: 90 }),
    playersPerPoint: faker.number.int({ min: 4, max: 7 }),
    timeoutPerHalf: faker.number.int({ min: 0, max: 2 }),
    floaterTimeout: faker.datatype.boolean(),
    teamOneScore: 0,
    teamTwoScore: 0,
    totalViews: faker.number.int(),
    teamOnePlayers: InGameStatsUserFactory.buildList(15),
    teamTwoPlayers: InGameStatsUserFactory.buildList(15),
    resolveCode: faker.string.numeric(6),
    teamOneStatus: faker.helpers.enumValue(GameStatus),
    teamTwoStatus: faker.helpers.enumValue(GameStatus),
}))

export const GameStatsFactory = Factory.define<GameStats>(() => ({
    _id: faker.database.mongodbObjectId(),
    teamOneId: faker.database.mongodbObjectId(),
    startTime: faker.date.past().toISOString(),
    points: [],
    momentumData: [],
    goalsLeader: {
        player: undefined,
        total: 0,
    },
    assistsLeader: {
        player: undefined,
        total: 0,
    },
    turnoversLeader: {
        player: undefined,
        total: 0,
    },
    blocksLeader: {
        player: undefined,
        total: 0,
    },
    plusMinusLeader: {
        player: undefined,
        total: 0,
    },
    pointsPlayedLeader: {
        player: undefined,
        total: 0,
    },
}))
