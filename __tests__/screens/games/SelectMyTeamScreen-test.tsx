import * as AuthData from '../../../src/services/data/auth'
import * as Constants from '../../../src/utils/constants'
import * as TeamData from '../../../src/services/data/team'
import * as UserData from '../../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { SelectMyTeamProps } from '../../../src/types/navigation'
import SelectMyTeamScreen from '../../../src/screens/games/SelectMyTeamScreen'
import { Team } from '../../../src/types/team'
import { fetchProfileData } from '../../../fixtures/data'
import { setProfile } from '../../../src/store/reducers/features/account/accountReducer'
import store from '../../../src/store/store'
import {
    fireEvent,
    render,
    waitFor,
    waitForElementToBeRemoved,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const addListener = jest.fn()
const push = jest.fn()

const props: SelectMyTeamProps = {
    navigation: {
        navigate,
        addListener,
        push,
    } as any,
    route: {} as any,
}

describe('SelectMyTeamScreen', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should match snapshot with unauthenticated user', async () => {
        jest.spyOn(AuthData, 'isLoggedIn').mockReturnValue(
            Promise.resolve(false),
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
        expect(snapshot.getByText(Constants.AUTH_TO_CREATE)).not.toBeNull()
        fireEvent.press(snapshot.getByText('log in'))
        expect(navigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Account',
            params: { screen: 'Login' },
        })
    })

    it('should match snapshot without manager teams', async () => {
        jest.spyOn(AuthData, 'isLoggedIn').mockReturnValue(
            Promise.resolve(true),
        )
        jest.spyOn(UserData, 'fetchProfile').mockReturnValueOnce(
            Promise.resolve({ ...fetchProfileData, managerTeams: [] }),
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
        expect(snapshot.getByText(Constants.MANAGE_TO_CREATE)).not.toBeNull()
        fireEvent.press(snapshot.getByText('create team'))
        expect(push).toHaveBeenCalledWith('Tabs', {
            screen: 'Account',
            params: { screen: 'CreateTeam' },
        })
    })

    it('should match snapshot with manager teams', async () => {
        jest.spyOn(AuthData, 'isLoggedIn').mockReturnValue(
            Promise.resolve(true),
        )
        jest.spyOn(UserData, 'fetchProfile').mockReturnValueOnce(
            Promise.resolve({ ...fetchProfileData, managerTeams: [] }),
        )
        jest.spyOn(TeamData, 'getTeam').mockReturnValueOnce(
            Promise.resolve({} as Team),
        )
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
        await waitFor(async () => {
            expect(navigate).toHaveBeenCalledWith('SelectOpponent', {})
        })
    })
})
