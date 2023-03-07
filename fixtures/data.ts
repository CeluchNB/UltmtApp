import { DetailedRequest } from '../src/types/request'
import { Game } from '../src/types/game'
import Point from '../src/types/point'
import { User } from '../src/types/user'
import {
    ActionType,
    LiveServerActionData,
    SavedServerActionData,
} from '../src/types/action'

export const fetchProfileData: User = {
    _id: 'testid',
    firstName: 'first',
    lastName: 'last',
    email: 'test@email.com',
    username: 'testuser',
    playerTeams: [
        {
            _id: 'id1',
            place: 'Place1',
            name: 'Name1',
            teamname: 'place1name1',
            seasonStart: '2019',
            seasonEnd: '2019',
        },
        {
            _id: 'id2',
            place: 'Place2',
            name: 'Name2',
            teamname: 'place2name2',
            seasonStart: '2020',
            seasonEnd: '2020',
        },
        {
            _id: 'id3',
            place: 'Place3',
            name: 'Name3',
            teamname: 'place3name3',
            seasonStart: '2021',
            seasonEnd: '2021',
        },
    ],
    requests: ['request1', 'request2'],
    managerTeams: [
        {
            _id: 'id4',
            place: 'Place4',
            name: 'Name4',
            teamname: 'place4name4',
            seasonStart: '2022',
            seasonEnd: '2022',
        },
    ],
    archiveTeams: [
        {
            _id: 'id7',
            place: 'Place7',
            name: 'Name7',
            teamname: 'place7name7',
            seasonStart: '2019',
            seasonEnd: '2019',
        },
    ],
    stats: [],
    openToRequests: false,
    private: false,
}

export const requestObject: DetailedRequest = {
    _id: 'request1',
    team: 'id1',
    user: 'playerid1',
    requestSource: 'team',
    teamDetails: {
        _id: 'id1',
        place: 'place',
        name: 'name',
        teamname: 'placename',
        seasonStart: '2022',
        seasonEnd: '2022',
    },
    userDetails: {
        _id: 'playerid1',
        firstName: 'first1',
        lastName: 'last1',
        username: 'first1last1',
    },
    status: 'pending',
}

const teamOne = {
    _id: 'team1',
    name: 'Temper',
    place: 'Pittsburgh',
    teamname: 'pghtemper',
    seasonStart: '2022',
    seasonEnd: '2022',
}

const tourney = {
    _id: 'tourney1',
    name: 'Club Nationals 2022',
    startDate: '2022-10-20',
    endDate: '2022-10-23',
    eventId: 'nationals22',
}

export const game: Game = {
    _id: 'game1',
    creator: {
        _id: 'user1',
        firstName: 'First 1',
        lastName: 'Last 1',
        username: 'first1last1',
    },
    teamOne: teamOne,
    teamTwo: { name: 'Sockeye' },
    teamTwoDefined: false,
    scoreLimit: 15,
    halfScore: 8,
    teamOneScore: 3,
    teamTwoScore: 0,
    startTime: new Date('2022-10-12'),
    softcapMins: 75,
    hardcapMins: 90,
    teamOneActive: true,
    teamTwoActive: false,
    playersPerPoint: 7,
    resolveCode: '111111',
    timeoutPerHalf: 1,
    floaterTimeout: true,
    teamOnePlayers: [],
    teamTwoPlayers: [],
    tournament: tourney,
    points: [],
}

export const reduxGame = {
    _id: 'game1',
    creator: {
        _id: 'user1',
        firstName: 'First 1',
        lastName: 'Last 1',
        username: 'first1last1',
    },
    teamOne: teamOne,
    teamTwo: { name: 'Sockeye' },
    teamTwoDefined: false,
    scoreLimit: 15,
    halfScore: 8,
    teamOneScore: 3,
    teamTwoScore: 0,
    startTime: '2022-10-12',
    softcapMins: 75,
    hardcapMins: 90,
    teamOneActive: true,
    teamTwoActive: false,
    playersPerPoint: 7,
    resolveCode: '111111',
    timeoutPerHalf: 1,
    floaterTimeout: true,
    teamOnePlayers: [],
    teamTwoPlayers: [],
    tournament: {
        _id: 'tourney1',
        name: 'Club Nationals 2022',
        startDate: '2022-10-20',
        endDate: '2022-10-23',
        eventId: 'nationals22',
    },
    points: [],
}

export const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    pullingTeam: { name: 'Temper' },
    receivingTeam: { name: 'Truck' },
    teamOnePlayers: [],
    teamTwoPlayers: [],
    teamOneScore: 2,
    teamTwoScore: 1,
    teamOneActive: true,
    teamTwoActive: false,
    teamOneActions: [],
    teamTwoActions: [],
}

export const liveAction: LiveServerActionData = {
    comments: [
        {
            comment: 'Test comment',
            commentNumber: 1,
            user: {
                _id: 'user1',
                firstName: 'First1',
                lastName: 'Last1',
                username: 'firstlast',
            },
        },
    ],
    actionNumber: 1,
    actionType: ActionType.PULL,
    tags: ['ib'],
    teamNumber: 'one',
}
export const savedAction: SavedServerActionData = {
    _id: 'action1',
    comments: [],
    actionNumber: 1,
    actionType: ActionType.PULL,
    tags: ['ib'],
    team: teamOne,
}
