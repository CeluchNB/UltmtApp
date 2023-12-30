import * as AccountReducer from '../../src/store/reducers/features/account/accountReducer'
import * as UserData from '../../src/services/data/user'
import { ManageTeamsProps } from '../../src/types/navigation'
import ManageTeamsScreen from '../../src/screens/ManageTeamsScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { User } from '../../src/types/user'
import { fetchProfileData } from '../../fixtures/data'
import store from '../../src/store/store'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})
const setOptions = jest.fn()

const props: ManageTeamsProps = {
    navigation: {
        navigate,
        addListener,
        setOptions,
    } as any,
    route: {} as any,
}

beforeEach(async () => {
    store.dispatch(AccountReducer.setProfile(fetchProfileData))
    jest.clearAllMocks()
})

it('should match snapshot', async () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

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

    expect(
        queryByText(`@${fetchProfileData.archiveTeams[0].teamname}`),
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

    fireEvent.press(playingTeam)

    expect(navigate).toHaveBeenCalledWith('PublicTeamDetails', {
        id: team._id,
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

    fireEvent.press(managingTeam)

    expect(navigate).toHaveBeenCalledWith('ManagedTeamDetails', {
        id: team._id,
    })
})

it('should navigate to public team screen', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const team = fetchProfileData.archiveTeams[0]
    const archiveTeam = getByText(`@${team.teamname}`)

    fireEvent.press(archiveTeam)

    expect(navigate).toHaveBeenCalledWith('PublicTeamDetails', {
        id: team._id,
        archive: true,
    })
})

it('should navigate to request team', async () => {
    const { getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    fireEvent.press(getAllByTestId('create-button')[0])

    expect(navigate).toHaveBeenCalledWith('RequestTeam')
})

it('should navigate to create team', async () => {
    const { getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    fireEvent.press(getAllByTestId('create-button')[1])

    expect(navigate).toHaveBeenCalledWith('CreateTeam')
})

it('should handle leave team', async () => {
    const leaveTeamSpy = jest
        .spyOn(UserData, 'leaveTeam')
        .mockImplementationOnce(async (_teamId: string) => {
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
                archiveTeams: [],
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

    fireEvent.press(deleteButtons[0])
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(
        queryByText(`@${fetchProfileData.playerTeams[0].teamname}`),
    ).toBeNull()
    expect(leaveTeamSpy).toHaveBeenCalled()
})

it('test update on refresh', async () => {
    const spy = jest
        .spyOn(UserData, 'fetchProfile')
        .mockReturnValueOnce(
            Promise.resolve({ ...fetchProfileData, username: 'username2' }),
        )

    const { queryByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(queryByText('username2')).toBeNull()

    const scrollView = getByTestId('mt-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(spy).toHaveBeenCalled()
    await waitFor(async () => await queryByText('@username2'))
})
