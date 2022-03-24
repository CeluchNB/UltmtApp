import * as AccountRedecure from '../../src/store/reducers/features/account/accountReducer'
import * as RequestData from '../../src/services/data/request'
import * as UserData from '../../src/services/data/user'
import ManageTeamsScreen from '../../src/screens/ManageTeamsScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import { User } from '../../src/types/user'
import { fetchProfileData } from '../../fixtures/data'
import renderer from 'react-test-renderer'
import store from '../../src/store/store'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const loginData = { token: 'sample.1234.token' }

const navigate = jest.fn()
const addListener = jest.fn()

const props: Props = {
    navigation: {
        navigate,
        addListener,
    } as any,
    route: {} as any,
}

beforeAll(async () => {
    store.dispatch(AccountRedecure.setToken(loginData))
    store.dispatch(AccountRedecure.setProfile(fetchProfileData))
})

beforeEach(async () => {
    jest.clearAllMocks()
})

it('should match snapshot', async () => {
    jest.useFakeTimers()
    const snapshot = renderer.create(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(snapshot).toMatchSnapshot()
})

it('should display teams correctly', async () => {
    const { queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(
        queryByText(`@${fetchProfileData.managerTeams[0].teamname}`),
    ).not.toBeNull()

    expect(
        queryByText(`@${fetchProfileData.playerTeams[0].teamname}`),
    ).not.toBeNull()

    expect(
        queryByText(`@${fetchProfileData.playerTeams[1].teamname}`),
    ).not.toBeNull()
})

it('should navigate to public team screen on playing team click', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const team = fetchProfileData.playerTeams[0]
    const playingTeam = getByText(`@${team.teamname}`)

    await act(async () => {
        fireEvent.press(playingTeam)
    })

    expect(navigate).toHaveBeenCalledWith('PublicTeamDetails', {
        id: team._id,
        place: team.place,
        name: team.name,
    })
})

it('should navigate to managed team screen on managing team click', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const team = fetchProfileData.managerTeams[0]
    const managingTeam = getByText(`@${team.teamname}`)

    await act(async () => {
        fireEvent.press(managingTeam)
    })

    expect(navigate).toHaveBeenCalledWith('ManagedTeamDetails', {
        id: team._id,
        place: team.place,
        name: team.name,
    })
})

it('should navigate to create team', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await act(async () => {
        fireEvent.press(getByText('create team'))
    })

    expect(navigate).toHaveBeenCalledWith('CreateTeam')
})

it('should navigate to request team', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await act(async () => {
        fireEvent.press(getByText('request team'))
    })

    expect(navigate).toHaveBeenCalledWith('RequestTeam')
})

it('should handle leave team', async () => {
    const leaveTeamSpy = jest
        .spyOn(UserData, 'leaveTeam')
        .mockImplementationOnce(async (_token: string, _teamId: string) => {
            const newUser: User = {
                _id: 'testid',
                firstName: 'first',
                lastName: 'last',
                email: 'test@email.com',
                username: 'testuser',
                playerTeams: [
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
            return newUser
        })

    const { queryByText, getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const deleteButtons = getAllByTestId('delete-button')
    await act(async () => {
        fireEvent.press(deleteButtons[0])
    })

    expect(leaveTeamSpy).toHaveBeenCalled()

    expect(
        queryByText(`@${fetchProfileData.playerTeams[0].teamname}`),
    ).toBeNull()
})
