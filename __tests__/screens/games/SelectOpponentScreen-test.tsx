import * as TeamData from '../../../src/services/data/team'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { SelectOpponentProps } from '../../../src/types/navigation'
import SelectOpponentScreen from '../../../src/screens/games/SelectOpponentScreen'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    waitForElementToBeRemoved,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const teamOne = {
    _id: 'team1',
    place: 'Place 1',
    name: 'Name 1',
    teamname: 'place1name1',
    seasonStart: '2022',
    seasonEnd: '2022',
}

const navigate = jest.fn()
const props: SelectOpponentProps = {
    navigation: {
        navigate,
    } as any,
    route: { params: { teamOne } } as any,
}

const client = new QueryClient()

describe('SelectOpponentScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers()
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
        const { getByTestId, getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <SelectOpponentScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>,
        )

        fireEvent.changeText(getByPlaceholderText('Search teams...'), 'team2')
        await waitForElementToBeRemoved(() => getByTestId('search-indicator'))

        const team = getByText('@place2name2')
        fireEvent.press(team)

        expect(navigate).toHaveBeenCalledWith('CreateGame', {
            teamTwo,
        })
    })

    it('with guest team', async () => {
        jest.spyOn(TeamData, 'searchTeam').mockReturnValue(Promise.resolve([]))
        const { getByTestId, getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <QueryClientProvider client={client}>
                    <SelectOpponentScreen {...props} />
                </QueryClientProvider>
            </NavigationContainer>,
        )

        fireEvent.changeText(getByPlaceholderText('Search teams...'), 'team2')
        await waitForElementToBeRemoved(() => getByTestId('search-indicator'))

        const team = getByText('continue with guest team')
        fireEvent.press(team)

        expect(navigate).toHaveBeenCalledWith('CreateGame', {
            teamTwo: { name: 'team2' },
        })
    })
})
