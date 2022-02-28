import * as UserData from '../../src/services/data/user'
import { DisplayTeam } from '../../src/types/team'
import ProfileScreen from '../../src/screens/ProfileScreen'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import { User } from '../../src/types/user'
import renderer from 'react-test-renderer'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { act, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const loginData = { token: 'sample.1234.token' }
const fetchProfileData: User = {
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
            seasonStart: '2019',
            seasonEnd: '2019',
        } as DisplayTeam,
        {
            _id: 'id2',
            place: 'Place2',
            name: 'Name2',
            seasonStart: '2020',
            seasonEnd: '2020',
        } as DisplayTeam,
        {
            _id: 'id3',
            place: 'Place3',
            name: 'Name3',
            seasonStart: '2021',
            seasonEnd: '2021',
        } as DisplayTeam,
    ],
    requests: [],
    managerTeams: [],
    stats: [],
    openToRequests: false,
    private: false,
}

const props: Props = {
    navigation: {
        navigate: jest.fn(),
        addListener: jest.fn(),
    } as any,
    route: {} as any,
}

beforeAll(() => {
    jest.spyOn(UserData, 'login').mockImplementation(
        async (_username: string, _password: string) => {
            return loginData.token
        },
    )

    jest.spyOn(UserData, 'fetchProfile').mockImplementation(
        async (_token: string) => {
            return fetchProfileData
        },
    )
})

it('profile screen matches snapshot', async () => {
    store.dispatch(setProfile(fetchProfileData))
    await act(async () => {
        const snapshot = renderer.create(
            <Provider store={store}>
                <ProfileScreen {...props} />
            </Provider>,
        )

        expect(snapshot).toMatchSnapshot()
    })
})

it('contains correct text from response', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <ProfileScreen {...props} />
        </Provider>,
    )

    await act(async () => {
        const title = getByText(
            `${fetchProfileData.firstName} ${fetchProfileData.lastName}`,
        )
        expect(title).toBeTruthy()

        const username = getByText(`@${fetchProfileData.username}`)
        expect(username).toBeTruthy()

        const team1 = getByText(
            `${fetchProfileData.playerTeams[0].place} ${fetchProfileData.playerTeams[0].name}`,
        )
        expect(team1).toBeTruthy()

        const team2 = getByText(
            `${fetchProfileData.playerTeams[1].place} ${fetchProfileData.playerTeams[1].name}`,
        )
        expect(team2).toBeTruthy()

        const team3 = getByText(
            `${fetchProfileData.playerTeams[2].place} ${fetchProfileData.playerTeams[2].name}`,
        )
        expect(team3).toBeTruthy()
    })
})
