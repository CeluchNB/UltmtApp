import * as GameData from '../../../src/services/data/game'
import { CreateGameProps } from '../../../src/types/navigation'
import CreateGameScreen from '../../../src/screens/games/CreateGameScreen'
import MockDate from 'mockdate'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { setProfile } from '../../../src/store/reducers/features/account/accountReducer'
import { setTeamOne } from '../../../src/store/reducers/features/game/liveGameReducer'
import store from '../../../src/store/store'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const teamOne = {
    _id: 'team1',
    place: 'Place 1',
    name: 'Name 1',
    teamname: 'place1name1',
    seasonStart: '2022',
    seasonEnd: '2022',
}

const teamTwo = {
    _id: 'team2',
    place: 'Place 2',
    name: 'Name 2',
    teamname: 'place2name2',
    seasonStart: '2022',
    seasonEnd: '2022',
}

const props: CreateGameProps = {
    navigation: {} as any,
    route: { params: { teamOne, teamTwo } } as any,
}

beforeAll(() => {
    MockDate.set('2022')
    store.dispatch(
        setProfile({
            _id: 'id1',
            firstName: 'First',
            lastName: 'Last',
            email: 'email@email.com',
            username: 'username',
            error: undefined,
            leaveManagerError: undefined,
            privateProfile: false,
            openToRequests: true,
            playerTeams: [],
            managerTeams: [],
            archiveTeams: [],
            requests: [],
            toggleRosterStatusLoading: false,
            editLoading: false,
            fetchProfileLoading: false,
        }),
    )
    store.dispatch(
        setTeamOne({
            ...teamOne,
            managers: [],
            players: [],
            seasonNumber: 2,
            continuationId: 'place1name1',
            rosterOpen: true,
            requests: [],
            games: [],
        }),
    )
})

afterAll(() => {
    MockDate.reset()
})

it('should match snapshot', () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateGameScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should create game', async () => {
    const spy = jest
        .spyOn(GameData, 'createGame')
        .mockReturnValue(Promise.resolve({} as any))
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateGameScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('start')
    fireEvent.press(button)

    // It would be better if I could wait for
    // a loading indicator to be gone
    await act(async () => {})

    expect(spy).toHaveBeenCalledWith(
        {
            teamOne,
            teamTwo,
            creator: {
                _id: 'id1',
                firstName: 'First',
                lastName: 'Last',
                username: 'username',
            },
            scoreLimit: 15,
            halfScore: 8,
            softcapMins: 75,
            hardcapMins: 90,
            playersPerPoint: 7,
            timeoutPerHalf: 1,
            floaterTimeout: true,
            teamTwoDefined: true,
            startTime: new Date(),
            tournament: undefined,
        },
        false,
        [],
    )
})
