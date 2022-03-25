import { DetailedRequest } from '../src/types/request'
import { User } from '../src/types/user'

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
