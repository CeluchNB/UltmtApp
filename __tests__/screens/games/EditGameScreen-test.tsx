import * as GameData from '../../../src/services/data/game'
import { EditGameProps } from '../../../src/types/navigation'
import EditGameScreen from '../../../src/screens/games/EditGameScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { game } from '../../../fixtures/data'
import { setGame } from '../../../src/store/reducers/features/game/liveGameReducer'
import store from '../../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const goBack = jest.fn()
const props: EditGameProps = {
    navigation: {
        goBack,
    } as any,
    route: {} as any,
}

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})

beforeEach(() => {
    store.dispatch(
        setGame({
            ...game,
            teamOnePlayers: [],
            tournament: undefined,
            startTime: '2022',
        }),
    )
})

afterAll(() => {
    jest.useRealTimers()
})

describe('EditGameScreen', () => {
    it('matches snapshot', () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <EditGameScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        expect(snapshot.getByText('Game to')).toBeTruthy()
        expect(snapshot.getByText('Half at')).toBeTruthy()
        expect(snapshot.getByText('make updates')).toBeTruthy()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('handles update press', async () => {
        const spy = jest.spyOn(GameData, 'editGame').mockReturnValue(
            Promise.resolve({
                ...game,
                teamOnePlayers: [],
                tournament: undefined,
                startTime: '2022' as unknown as Date,
            }),
        )

        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <EditGameScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        const updateBtn = getByText('make updates')
        fireEvent.press(updateBtn)

        await waitFor(async () => {
            expect(spy).toHaveBeenCalled()
        })
        expect(goBack).toHaveBeenCalled()
    })
})
