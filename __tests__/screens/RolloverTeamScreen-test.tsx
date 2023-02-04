import * as ManagedTeamReducer from '../../src/store/reducers/features/team/managedTeamReducer'
import * as TeamData from '../../src/services/data/team'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { RolloverTeamProps } from '../../src/types/navigation'
import RolloverTeamScreen from '../../src/screens/RolloverTeamScreen'
import { Team } from '../../src/types/team'
import mockDate from 'mockdate'
import store from '../../src/store/store'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const goBack = jest.fn()
const navigate = jest.fn()
const setOptions = jest.fn()

const props: RolloverTeamProps = {
    navigation: {
        goBack,
        navigate,
        setOptions,
    } as any,
    route: {} as any,
}

beforeAll(() => {
    store.dispatch(ManagedTeamReducer.setTeam({ _id: 'team1' }))
    mockDate.set('06/01/2022')
})

afterAll(() => {
    mockDate.reset()
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

it('should match snapshot with open requests', async () => {
    const pendingReqProps: RolloverTeamProps = {
        navigation: {
            goBack,
            navigate,
            setOptions,
        } as any,
        route: {} as any,
    }
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <RolloverTeamScreen {...pendingReqProps} />
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
        'team1',
        false,
        currentYear.toString(),
        currentYear.toString(),
    )
    expect(navigate).toHaveBeenCalled()
})

it('should handle rollover error', async () => {
    const spy = jest
        .spyOn(TeamData, 'rollover')
        .mockReturnValueOnce(
            Promise.reject({ message: 'Unable to rollover team' }),
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
