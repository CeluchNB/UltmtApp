import { DisplayTeamFactory } from './team'
import { DisplayUserFactory } from './user'
import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import Point, { PointStatus } from '../../src/types/point'

export const PointFactory = Factory.define<Point>(() => ({
    _id: faker.database.mongodbObjectId(),
    gameId: faker.database.mongodbObjectId(),
    pointNumber: faker.number.int({ min: 1, max: 10 }),
    teamOnePlayers: DisplayUserFactory.buildList(7),
    teamTwoPlayers: DisplayUserFactory.buildList(7),
    teamOneActivePlayers: DisplayUserFactory.buildList(7),
    teamTwoActivePlayers: DisplayUserFactory.buildList(7),
    teamOneActions: [],
    teamTwoActions: [],
    teamOneScore: faker.number.int({ min: 0, max: 15 }),
    teamTwoScore: faker.number.int({ min: 0, max: 15 }),
    pullingTeam: DisplayTeamFactory.build(),
    receivingTeam: DisplayTeamFactory.build(),
    teamOneStatus: faker.helpers.enumValue(PointStatus),
    teamTwoStatus: faker.helpers.enumValue(PointStatus),
}))
