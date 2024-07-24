import { Factory } from 'fishery'
import { Team } from '../../src/types/team'
import { faker } from '@faker-js/faker'

export const TeamFactory = Factory.define<Team>(() => ({
    _id: faker.database.mongodbObjectId(),
    name: faker.lorem.word(),
    place: faker.location.city(),
    players: [],
    managers: [],
    seasonNumber: faker.number.int({ min: 1, max: 5 }),
    continuationId: faker.database.mongodbObjectId(),
    rosterOpen: true,
    requests: [],
    teamname: faker.internet.userName(),
    seasonStart: faker.date.past().toDateString(),
    seasonEnd: faker.date.future().toISOString(),
}))
