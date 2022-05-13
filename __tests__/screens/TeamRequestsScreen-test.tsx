import * as ManagedTeamReducer from '../../src/store/reducers/features/team/managedTeamReducer'
// import * as RequestData from '../../src/services/data/request'
import * as TeamData from '../../src/services/data/team'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import { Team } from '../../src/types/team'
import TeamRequestsScreen from '../../src/screens/TeamRequestsScreen'
import store from '../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})

const props: Props = {
    navigation: {
        navigate,
        addListener,
    } as any,
    route: {} as any,
}

it('should match snapshot', () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should toggle roster status', async () => {
    const dataFn = jest
        .fn()
        .mockImplementationOnce(async (_token, id, open) => {
            return { rosterOpen: open } as Team
        })
    const spy = jest.spyOn(ManagedTeamReducer, 'toggleRosterStatus')

    jest.spyOn(TeamData, 'toggleRosterStatus').mockImplementationOnce(dataFn)

    const { getByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <TeamRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Open Roster')
    fireEvent.press(button)

    waitFor(() => queryByText('Close Roster'))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(dataFn).toHaveBeenCalledTimes(1)
})
