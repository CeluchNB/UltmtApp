import * as TeamData from '../../src/services/data/team'
import { NavigationContainer } from '@react-navigation/native'
import { PublicTeamDetailsProps } from '../../src/types/navigation'
import PublicTeamScreen from '../../src/screens/PublicTeamScreen'
import React from 'react'
import { Team } from '../../src/types/team'
import renderer from 'react-test-renderer'
import { act, fireEvent, render } from '@testing-library/react-native'

const navigate = jest.fn()
const addListener = jest.fn()

const props: PublicTeamDetailsProps = {
    navigation: {
        navigate,
        addListener,
        isFocused: () => true,
    } as any,
    route: { params: { id: 'id1', place: 'Place', name: 'Name' } } as any,
}

const team: Team = {
    _id: 'id1',
    place: 'Place',
    name: 'Name',
    teamname: 'placename',
    managers: [],
    players: [
        {
            _id: 'id',
            firstName: 'First',
            lastName: 'Last',
            username: 'firstlast',
        },
    ],
    seasonNumber: 1,
    seasonStart: '2022',
    seasonEnd: '2022',
    continuationId: 'id123',
    rosterOpen: true,
    requests: [],
    games: [],
}

beforeEach(() => {
    navigate.mockReset()
    addListener.mockReset()
})

it('should match snapshot', async () => {
    jest.useFakeTimers()
    const snapshot = renderer.create(
        <NavigationContainer>
            <PublicTeamScreen {...props} />
        </NavigationContainer>,
    )

    expect(snapshot).toMatchSnapshot()
})

it('should display team name', async () => {
    const { findByText } = render(
        <NavigationContainer>
            <PublicTeamScreen {...props} />
        </NavigationContainer>,
    )

    const title = findByText('Place Name')
    expect(title).toBeTruthy()
})

it('should handle player click', async () => {
    const spy = jest
        .spyOn(TeamData, 'getTeam')
        .mockReturnValueOnce(Promise.resolve(team))
    const { getByText, getByTestId } = render(
        <NavigationContainer>
            <PublicTeamScreen {...props} />
        </NavigationContainer>,
    )
    await act(async () => {
        const scrollView = getByTestId('public-team-scroll-view')
        const { refreshControl } = scrollView.props
        refreshControl.props.onRefresh()
    })

    const playerView = getByText(
        `${team.players[0].firstName} ${team.players[0].lastName}`,
    )

    fireEvent.press(playerView)
    expect(navigate).toHaveBeenCalled()
    spy.mockRestore()
})

it('should handle error get team error', async () => {
    const spy = jest
        .spyOn(TeamData, 'getTeam')
        .mockReturnValueOnce(Promise.reject({ message: 'error' }))
    const { getByText, getByTestId } = render(
        <NavigationContainer>
            <PublicTeamScreen {...props} />
        </NavigationContainer>,
    )

    await act(async () => {
        const scrollView = getByTestId('public-team-scroll-view')
        const { refreshControl } = scrollView.props
        refreshControl.props.onRefresh()
    })

    const errorText = getByText('error')
    expect(errorText).toBeTruthy()
    spy.mockRestore()
})
