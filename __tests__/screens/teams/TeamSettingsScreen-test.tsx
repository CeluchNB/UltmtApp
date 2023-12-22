import * as TeamServices from '../../../src/services/data/team'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import TeamSettingsScreen from '../../../src/screens/teams/TeamSettingsScreen'
import store from '../../../src/store/store'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

const navigate = jest.fn()
const props = {
    navigation: { navigate } as any,
    route: {} as any,
}

const client = new QueryClient()

describe('TeamSettingsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('matches snapshot', async () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <TeamSettingsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        expect(snapshot).toMatchSnapshot()
    })

    it('navigates to rollover screen', async () => {
        render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <TeamSettingsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        const deleteBtn = screen.getByText('Rollover')
        fireEvent.press(deleteBtn)

        expect(navigate).toHaveBeenCalledWith('RolloverTeam')
    })

    it('calls delete', async () => {
        const deleteSpy = jest
            .spyOn(TeamServices, 'deleteTeam')
            .mockReturnValue(Promise.resolve())

        render(
            <Provider store={store}>
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <TeamSettingsScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>
            </Provider>,
        )

        const deleteBtn = screen.getByText('Delete')
        fireEvent.press(deleteBtn)

        const confirmBtn = screen.getByText('confirm')
        fireEvent.press(confirmBtn)

        await waitFor(async () => {
            expect(deleteSpy).toHaveBeenCalled()
            expect(navigate).toHaveBeenCalledWith('ManageTeams')
        })
    })
})
