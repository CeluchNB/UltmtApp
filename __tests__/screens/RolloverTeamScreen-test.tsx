import * as AccountReducer from '../../src/store/reducers/features/account/accountReducer'
import * as ManagedTeamReducer from '../../src/store/reducers/features/team/managedTeamReducer'
import * as TeamData from '../../src/services/data/team'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import RolloverTeamScreen from '../../src/screens/RolloverTeamScreen'
import { Team } from '../../src/types/team'
import store from '../../src/store/store'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const goBack = jest.fn()

const token = '1234.asdf.6543'
const props: Props = {
    navigation: {
        goBack,
    } as any,
    route: {} as any,
}

beforeAll(() => {
    store.dispatch(AccountReducer.setToken(token))
    store.dispatch(ManagedTeamReducer.setTeam({ _id: 'team1' }))
})

it('should match snapshot', async () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <RolloverTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should handle successful rollover', async () => {
    const spy = jest.spyOn(TeamData, 'rollover').mockReturnValueOnce(
        Promise.resolve({
            _id: 'team1',
        } as Team),
    )
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RolloverTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Submit')
    fireEvent.press(button)
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    const currentYear = new Date().getFullYear()
    expect(spy).toHaveBeenCalledWith(
        token,
        'team1',
        false,
        currentYear.toString(),
        currentYear.toString(),
    )
    expect(goBack).toHaveBeenCalled()
})

it('should handle rollover error', async () => {
    const spy = jest
        .spyOn(TeamData, 'rollover')
        .mockReturnValueOnce(Promise.reject({}))

    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RolloverTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Submit')
    fireEvent.press(button)
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(spy).toHaveBeenCalled()
    expect(getByText('Unable to rollover team')).toBeTruthy()
})

it('should display custom rollover error', async () => {
    const spy = jest
        .spyOn(TeamData, 'rollover')
        .mockReturnValueOnce(
            Promise.reject({ message: 'custom rollover error' }),
        )

    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <RolloverTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Submit')
    fireEvent.press(button)
    // Not optimal solution, see
    // ManageTeamDetailsScreen-test.tsx for further details
    await act(async () => {})

    expect(spy).toHaveBeenCalled()
    expect(getByText('custom rollover error')).toBeTruthy()
})
