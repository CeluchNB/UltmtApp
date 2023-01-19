import * as Constants from '../../../src/utils/constants'
import * as GameData from '../../../src/services/data/game'
import { JoinGameProps } from '../../../src/types/navigation'
import JoinGameScreen from '../../../src/screens/games/JoinGameScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { setTeamOne } from '../../../src/store/reducers/features/game/liveGameReducer'
import store from '../../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { game, point } from '../../../fixtures/data'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const props: JoinGameProps = {
    navigation: { navigate: jest.fn() } as any,
    route: {} as any,
}

describe('JoinGameScreen', () => {
    beforeAll(() => {
        store.dispatch(
            setTeamOne({
                place: 'Pittsburgh',
                name: 'Temper',
                teamname: 'temper',
                seasonStart: '2022',
                seasonEnd: '2022',
            }),
        )
    })
    beforeEach(() => {
        jest.spyOn(GameData, 'searchGames').mockReturnValueOnce(
            Promise.resolve([game]),
        )
        jest.spyOn(GameData, 'joinGame').mockReturnValueOnce(
            Promise.resolve(game),
        )
        jest.spyOn(GameData, 'getPointsByGame').mockReturnValueOnce(
            Promise.resolve([point]),
        )
    })

    it('should match snapshot', () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <JoinGameScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        expect(snapshot).toMatchSnapshot()
    })

    it('should handle search', async () => {
        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <JoinGameScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        const search = getByPlaceholderText('Search Games...')
        fireEvent.changeText(search, 'sockeye')

        await waitFor(() => {
            expect(getByText('Sockeye')).toBeTruthy()
        })
    })

    it('should handle join', async () => {
        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <JoinGameScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        const search = getByPlaceholderText('Search Games...')
        fireEvent.changeText(search, 'sockeye')

        await waitFor(() => {
            expect(getByText('Sockeye')).toBeTruthy()
        })

        const gameCard = getByText('Sockeye')
        fireEvent.press(gameCard)

        await waitFor(() => {
            expect(getByText('Join With Code')).toBeTruthy()
        })

        const input = getByPlaceholderText('6 Digit Code')
        fireEvent.changeText(input, '123456')

        const button = getByText('join')
        fireEvent.press(button)

        await waitFor(() => {
            expect(props.navigation.navigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'FirstPoint',
            })
        })

        expect(store.getState().liveGame.team).toBe('two')
        expect(store.getState().liveGame.game._id).toBe(game._id)
        expect(store.getState().livePoint.point._id).toBe(point._id)
    })

    it('should handle join error', async () => {
        jest.spyOn(GameData, 'joinGame')
            .mockReset()
            .mockReturnValueOnce(Promise.reject())

        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <JoinGameScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        const search = getByPlaceholderText('Search Games...')
        fireEvent.changeText(search, 'sockeye')

        await waitFor(() => {
            expect(getByText('Sockeye')).toBeTruthy()
        })

        const gameCard = getByText('Sockeye')
        fireEvent.press(gameCard)

        await waitFor(() => {
            expect(getByText('Join With Code')).toBeTruthy()
        })

        const input = getByPlaceholderText('6 Digit Code')
        fireEvent.changeText(input, '123456')

        const button = getByText('join')
        fireEvent.press(button)

        await waitFor(() => {
            expect(getByText(Constants.JOIN_GAME_ERROR)).toBeTruthy()
        })
    })
})
