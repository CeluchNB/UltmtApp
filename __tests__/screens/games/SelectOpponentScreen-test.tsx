import * as TeamData from '../../../src/services/data/team'
import { CreateGameProvider } from '../../../src/context/create-game-context'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { SelectOpponentProps } from '../../../src/types/navigation'
import SelectOpponentScreen from '../../../src/screens/games/SelectOpponentScreen'
import { fetchProfileData } from '../../../fixtures/data'
import { setProfile } from '../../../src/store/reducers/features/account/accountReducer'
import store from '../../../src/store/store'
import { withRealm } from '../../utils/renderers'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react-native'

const teamOne = {
    _id: 'team1',
    place: 'Place 1',
    name: 'Name 1',
    teamname: 'place1name1',
    seasonStart: '2022',
    seasonEnd: '2022',
}

const navigate = jest.fn()
const reset = jest.fn()
const props: SelectOpponentProps = {
    navigation: {
        navigate,
        reset,
    } as any,
    route: { params: { teamOne } } as any,
}

const client = new QueryClient()

describe('SelectOpponentScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers()
        store.dispatch(setProfile(fetchProfileData))
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <SelectOpponentScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>,
        )

        await waitForElementToBeRemoved(() =>
            snapshot.getByTestId('search-indicator'),
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should navigate with search result', async () => {
        const teamTwo = {
            _id: 'team2',
            managers: [],
            players: [],
            seasonNumber: 1,
            continuationId: 'team2',
            rosterOpen: false,
            requests: [],
            games: [],
            place: 'Place2',
            name: 'Name2',
            teamname: 'place2name2',
            seasonStart: '2022',
            seasonEnd: '2022',
        }
        jest.spyOn(TeamData, 'searchTeam').mockReturnValue(
            Promise.resolve([teamTwo]),
        )
        render(
            withRealm(
                <Provider store={store}>
                    <NavigationContainer>
                        <QueryClientProvider client={client}>
                            <CreateGameProvider>
                                <SelectOpponentScreen {...props} />
                            </CreateGameProvider>
                        </QueryClientProvider>
                    </NavigationContainer>
                </Provider>,
            ),
        )

        fireEvent.changeText(
            screen.getByPlaceholderText('Search teams...'),
            'team2',
        )
        await waitForElementToBeRemoved(() =>
            screen.getByTestId('search-indicator'),
        )

        const team = screen.getByText('@place2name2')
        fireEvent.press(team)

        expect(reset).toHaveBeenCalledWith({
            index: 1,
            routes: [{ name: 'Tabs' }, { name: 'CreateGame' }],
        })
    })

    it('with guest team', async () => {
        jest.spyOn(TeamData, 'searchTeam').mockReturnValue(Promise.resolve([]))
        render(
            withRealm(
                <Provider store={store}>
                    <NavigationContainer>
                        <QueryClientProvider client={client}>
                            <CreateGameProvider>
                                <SelectOpponentScreen {...props} />
                            </CreateGameProvider>
                        </QueryClientProvider>
                    </NavigationContainer>
                </Provider>,
            ),
        )

        fireEvent.changeText(
            screen.getByPlaceholderText('Search teams...'),
            'team2',
        )
        await waitForElementToBeRemoved(() =>
            screen.getByTestId('search-indicator'),
        )

        const team = screen.getByText('continue with guest team')
        fireEvent.press(team)

        expect(reset).toHaveBeenCalledWith({
            index: 1,
            routes: [{ name: 'Tabs' }, { name: 'CreateGame' }],
        })
    })
})
