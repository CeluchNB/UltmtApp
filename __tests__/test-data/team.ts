import { Factory } from 'fishery'
import { faker } from '@faker-js/faker'
import { DisplayTeam, Team } from '../../src/types/team'

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
    seasonStart: faker.date.past().toISOString(),
    seasonEnd: faker.date.future().toISOString(),
}))

export const DisplayTeamFactory = Factory.define<DisplayTeam>(() => ({
    _id: faker.database.mongodbObjectId(),
    name: faker.lorem.word(),
    place: faker.location.city(),
    teamname: faker.internet.userName(),
    seasonStart: faker.date.past().toISOString(),
    seasonEnd: faker.date.future().toISOString(),
}))
