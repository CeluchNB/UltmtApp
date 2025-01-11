import { CreateGameProps } from '../../../src/types/navigation'
import CreateGameScreen from '../../../src/screens/games/CreateGameScreen'
import MockDate from 'mockdate'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react-native'

const teamOne = {
    _id: 'team1',
    place: 'Place 1',
    name: 'Name 1',
    teamname: 'place1name1',
    seasonStart: '2022',
    seasonEnd: '2022',
}

const teamTwo = {
    _id: 'team2',
    place: 'Place 2',
    name: 'Name 2',
    teamname: 'place2name2',
    seasonStart: '2022',
    seasonEnd: '2022',
}

const navigate = jest.fn()
const props: CreateGameProps = {
    navigation: { setOptions: jest.fn(), navigate } as any,
    route: { params: { teamOne, teamTwo } } as any,
}

jest.mock('@react-native-community/netinfo', () => {
    return {
        useNetInfo: () => {
            return {
                isInternetReachable: true,
            }
        },
    }
})

jest.mock('react-native-paper', () => {
    const RNPaper = jest.requireActual('react-native-paper')
    return {
        ...RNPaper,
        Tooltip: () => {
            return <div>Network status indicator</div>
        },
    }
})

describe('CreateGameScreen', () => {
    beforeAll(() => {
        MockDate.set('2022')
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        MockDate.reset()
        jest.useRealTimers()
    })

    it('should match snapshot', () => {
        const snapshot = render(
            <NavigationContainer>
                <CreateGameScreen {...props} />
            </NavigationContainer>,
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should create game', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <CreateGameScreen {...props} />
            </NavigationContainer>,
        )

        const button = getByText('create game')
        fireEvent.press(button)

        // It would be better if I could wait for
        // a loading indicator to be gone
        await act(async () => {})
    })

    it('navigates to search tournaments screen', async () => {
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <CreateGameScreen {...props} />
            </NavigationContainer>,
        )

        const tournamentField = getByText('N/A')
        fireEvent.press(tournamentField)
        expect(navigate).toHaveBeenCalledWith('SearchTournaments')

        navigate.mockClear()

        const tournamentButton = getByTestId('search-tournament-button')
        fireEvent.press(tournamentButton)
        expect(navigate).toHaveBeenCalledWith('SearchTournaments')
    })
})
