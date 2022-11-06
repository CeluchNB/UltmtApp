import * as AuthData from '../../../src/services/data/auth'
import * as Constants from '../../../src/utils/constants'
import { AllScreenProps } from '../../../src/types/navigation'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import SelectMyTeamScreen from '../../../src/screens/games/SelectMyTeamScreen'
import { setProfile } from '../../../src/store/reducers/features/account/accountReducer'
import store from '../../../src/store/store'
import {
    fireEvent,
    render,
    waitForElementToBeRemoved,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const addListener = jest.fn()
const push = jest.fn()

const props: AllScreenProps = {
    navigation: {
        navigate,
        addListener,
        push,
    } as any,
    route: {} as any,
}

it('should match snapshot with unauthenticated user', async () => {
    jest.spyOn(AuthData, 'isLoggedIn').mockReturnValue(Promise.resolve(false))
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <SelectMyTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitForElementToBeRemoved(() =>
        snapshot.getByTestId('select-team-loading'),
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
    expect(snapshot.getByText(Constants.AUTH_TO_CREATE)).not.toBeNull()
    fireEvent.press(snapshot.getByText('log in'))
    expect(navigate).toHaveBeenCalledWith('Tabs', {
        screen: 'Account',
        params: { screen: 'Login' },
    })
})

it('should match snapshot without manager teams', async () => {
    jest.spyOn(AuthData, 'isLoggedIn').mockReturnValue(Promise.resolve(true))
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <SelectMyTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitForElementToBeRemoved(() =>
        snapshot.getByTestId('select-team-loading'),
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
    expect(snapshot.getByText(Constants.MANAGE_TO_CREATE)).not.toBeNull()
    fireEvent.press(snapshot.getByText('create team'))
    expect(push).toHaveBeenCalledWith('Tabs', {
        screen: 'Account',
        params: { screen: 'CreateTeam' },
    })
})

it('should match snapshot with manager teams', async () => {
    jest.spyOn(AuthData, 'isLoggedIn').mockReturnValue(Promise.resolve(true))
    store.dispatch(
        setProfile({
            managerTeams: [
                {
                    _id: 'team1',
                    place: 'Place',
                    name: 'Name',
                    teamname: 'place1name1',
                    seasonStart: '2022',
                    seasonEnd: '2022',
                },
            ],
        }),
    )
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <SelectMyTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await waitForElementToBeRemoved(() =>
        snapshot.getByTestId('select-team-loading'),
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
    expect(snapshot.getByText('@place1name1')).not.toBeNull()
    fireEvent.press(snapshot.getByText('@place1name1'))
    expect(navigate).toHaveBeenCalledWith('SelectOpponent', {
        teamOne: {
            _id: 'team1',
            place: 'Place',
            name: 'Name',
            teamname: 'place1name1',
            seasonStart: '2022',
            seasonEnd: '2022',
        },
    })
})
