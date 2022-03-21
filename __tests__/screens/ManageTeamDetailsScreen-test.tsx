import * as ManagedTeamReducer from '../../src/store/reducers/features/team/managedTeamReducer'
import * as RequestData from '../../src/services/data/request'
import * as TeamData from '../../src/services/data/team'
import { DetailedRequest } from '../../src/types/request'
import ManageTeamDetailsScreen from '../../src/screens/ManageTeamDetailsScreen'
import { ManagedTeamDetailsProps } from '../../src/types/navigation'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { Team } from '../../src/types/team'
import renderer from 'react-test-renderer'
import { setToken } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const goBack = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})

const props: ManagedTeamDetailsProps = {
    navigation: {
        addListener,
        navigate,
        goBack,
    } as any,
    route: {
        params: {
            id: 'id1',
            place: 'place',
            name: 'name',
        },
    } as any,
}

beforeAll(() => {
    store.dispatch(setToken('123.1234.gfads23'))
    jest.useFakeTimers()
})

beforeEach(() => {
    navigate.mockClear()
    goBack.mockClear()
    addListener.mockClear()
})

afterAll(() => {
    jest.useRealTimers()
})

it('should match snapshot', async () => {
    const snapshot = renderer.create(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(snapshot).toMatchSnapshot()
})

it('should navigate to rollover a team', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Start New Season')

    fireEvent.press(button)

    expect(navigate).toHaveBeenCalledTimes(1)
})

it('should toggle roster status', async () => {
    const dataFn = jest.fn().mockImplementationOnce(async (token, id, open) => {
        return { rosterOpen: open } as Team
    })
    const spy = jest.spyOn(ManagedTeamReducer, 'toggleRosterStatus')

    jest.spyOn(TeamData, 'toggleRosterStatus').mockImplementationOnce(dataFn)

    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Open Roster')
    await act(async () => {
        fireEvent.press(button)
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(dataFn).toHaveBeenCalledTimes(1)
    const closeButton = getByText('Close Roster')
    expect(closeButton).toBeTruthy()
})

it('should handle swipe to refresh', async () => {
    jest.spyOn(RequestData, 'getRequest').mockImplementation(
        async (token, requestId) => {
            const requestObject: DetailedRequest = {
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
            if (requestId === 'request1') {
                requestObject.requestSource = 'team'
                requestObject.userDetails = {
                    _id: 'playerid2',
                    firstName: 'first2',
                    lastName: 'last2',
                    username: 'first2last2',
                }
            } else if (requestId === 'request2') {
                requestObject.requestSource = 'player'
                requestObject.userDetails = {
                    _id: 'playerid3',
                    firstName: 'first3',
                    lastName: 'last3',
                    username: 'first3last3',
                }
            }
            return requestObject
        },
    )
    jest.spyOn(TeamData, 'getManagedTeam').mockReturnValueOnce(
        Promise.resolve({
            _id: 'id1',
            place: 'place',
            name: 'name',
            teamname: 'placename',
            players: [
                {
                    _id: 'playerid1',
                    firstName: 'first1',
                    lastName: 'last1',
                    username: 'first1last1',
                },
            ],
            requests: ['request1', 'request2'],
        } as Team),
    )

    const { getByText, getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ManageTeamDetailsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const scrollView = getByTestId('mtd-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        await refreshControl.props.onRefresh()
    })

    // check data is passed and displayed correctly
    const teamname = getByText('@placename')
    expect(teamname).toBeTruthy()

    // player displayed correctly
    const player = getByText('@first1last1')
    expect(player).toBeTruthy()

    // test team request displayed correctly
    const teamRequest = getByText('@first2last2')
    expect(teamRequest).toBeTruthy()

    // test player request displayed correctly
    const playerRequest = getByText('@first3last3')
    expect(playerRequest).toBeTruthy()
})
