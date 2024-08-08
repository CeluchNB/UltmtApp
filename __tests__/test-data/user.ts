import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { DisplayUser, InGameStatsUser } from '../../src/types/user'

export const DisplayUserFactory = Factory.define<DisplayUser>(() => ({
    _id: faker.database.mongodbObjectId(),
    username: faker.internet.userName(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
}))

export const InGameStatsUserFactory = Factory.define<InGameStatsUser>(() => ({
    _id: faker.database.mongodbObjectId(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    username: faker.internet.userName(),
    pointsPlayed: faker.number.int({ min: 0, max: 10 }),
    goals: faker.number.int({ min: 0, max: 10 }),
    blocks: faker.number.int({ min: 0, max: 10 }),
    assists: faker.number.int({ min: 0, max: 10 }),
    turnovers: faker.number.int({ min: 0, max: 10 }),
}))
