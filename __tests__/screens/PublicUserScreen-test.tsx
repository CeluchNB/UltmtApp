import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { PublicUserDetailsProps } from '../../src/types/navigation'
import PublicUserScreen from '../../src/screens/PublicUserScreen'
import React from 'react'
import { User } from '../../src/types/user'
import { act, fireEvent, render } from '@testing-library/react-native'

const navigate = jest.fn()
const addListener = jest.fn()

const props: PublicUserDetailsProps = {
    navigation: {
        addListener,
        navigate,
    } as any,
    route: {
        params: {
            user: {
                _id: 'id1',
                firstName: 'first',
                lastName: 'last',
                username: 'firstlast',
            },
        },
    } as any,
}

beforeAll(() => {
    jest.spyOn(UserData, 'getPublicUser').mockResolvedValue(
        Promise.resolve({
            _id: 'id1',
            firstName: 'first',
            lastName: 'last',
            username: 'firstlast',
            email: 'firstlast@email.com',
            playerTeams: [
                {
                    _id: 'team1',
                    place: 'place1',
                    name: 'name1',
                    teamname: 'place1name1',
                    seasonStart: '2022',
                    seasonEnd: '2022',
                },
                {
                    _id: 'team2',
                    place: 'place2',
                    name: 'name2',
                    teamname: 'place2name2',
                    seasonStart: '2021',
                    seasonEnd: '2021',
                },
            ],
            requests: [],
            openToRequests: false,
            managerTeams: [],
            stats: [],
            archiveTeams: [],
            private: false,
        } as User),
    )
})

it('should match snapshot', async () => {
    const snapshot = render(
        <NavigationContainer>
            <PublicUserScreen {...props} />
        </NavigationContainer>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it("should display user's teams", async () => {
    const { queryByText, getByTestId } = render(
        <NavigationContainer>
            <PublicUserScreen {...props} />
        </NavigationContainer>,
    )

    const scrollView = getByTestId('public-user-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('@place1name1')).not.toBeNull()
    expect(queryByText('@place2name2')).not.toBeNull()
})

it('should navigate to a public team', async () => {
    const { getByText, getByTestId } = render(
        <NavigationContainer>
            <PublicUserScreen {...props} />
        </NavigationContainer>,
    )

    const scrollView = getByTestId('public-user-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    const teamView = getByText('@place1name1')
    fireEvent.press(teamView)

    expect(navigate).toHaveBeenCalledWith('PublicTeamDetails', {
        id: 'team1',
        place: 'place1',
        name: 'name1',
    })
})

it('should handle get user error', async () => {
    jest.spyOn(UserData, 'getPublicUser').mockReturnValueOnce(
        Promise.reject({
            message: 'Error getting user',
        }),
    )
    const { queryByText, getByTestId } = render(
        <NavigationContainer>
            <PublicUserScreen {...props} />
        </NavigationContainer>,
    )

    const scrollView = getByTestId('public-user-scroll-view')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(queryByText('Error getting user')).not.toBeNull()
})
