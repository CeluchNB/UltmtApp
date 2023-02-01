import * as GameData from '../../../src/services/data/game'
import * as PointData from '../../../src/services/data/point'
import { NavigationContainer } from '@react-navigation/native'
import { OfflineGameOptionsProps } from '../../../src/types/navigation'
import OfflineGameOptionsScreen from '../../../src/screens/games/OfflineGameOptionsScreen'
import { Provider } from 'react-redux'
import React from 'react'
import { setProfile } from '../../../src/store/reducers/features/account/accountReducer'
import store from '../../../src/store/store'
import { Game, LocalGame } from '../../../src/types/game'
import { fetchProfileData, game } from '../../../fixtures/data'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const mockedNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
        }),
    }
})

const createGame = (overrides: Partial<Game>): Game & { offline: boolean } => {
    return {
        ...game,
        offline: false,
        ...overrides,
    }
}

const props: OfflineGameOptionsProps = {
    navigation: {
        navigate: mockedNavigate,
    } as any,
    route: { params: { gameId: 'game1' } } as any,
}

beforeEach(async () => {
    jest.resetAllMocks()
    store.dispatch(setProfile(fetchProfileData))
    jest.spyOn(GameData, 'getOfflineGameById').mockReturnValue(
        Promise.resolve(
            createGame({
                creator: {
                    _id: fetchProfileData._id,
                    firstName: fetchProfileData.firstName,
                    lastName: fetchProfileData.lastName,
                    username: fetchProfileData.username,
                },
            }),
        ),
    )
})

describe('OfflineGameOptionsScreen', () => {
    it('renders', async () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <OfflineGameOptionsScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        await waitFor(async () => {
            expect(snapshot.getByText(game.teamOne.name)).toBeTruthy()
        })

        expect(snapshot.getByText(game.teamTwo.name)).toBeTruthy()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('handles push', async () => {
        const spy = jest
            .spyOn(GameData, 'pushOfflineGame')
            .mockReturnValueOnce(Promise.resolve())

        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <OfflineGameOptionsScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        await waitFor(async () => {
            expect(getByText(game.teamOne.name)).toBeTruthy()
        })

        const button = getByText('push to cloud')
        fireEvent.press(button)

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('ActiveGames')
        })

        expect(spy).toHaveBeenCalled()
    })

    it('handles reactivate', async () => {
        jest.spyOn(GameData, 'resurrectActiveGame').mockReturnValueOnce(
            Promise.resolve({
                ...game,
                tournament: undefined,
                startTime: '2022',
                offline: false,
            } as unknown as LocalGame),
        )
        jest.spyOn(PointData, 'getActivePointForGame').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        const { getByText } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <OfflineGameOptionsScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        await waitFor(async () => {
            expect(getByText(game.teamOne.name)).toBeTruthy()
        })

        fireEvent.press(getByText('reactivate'))

        await waitFor(async () => {
            expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
                screen: 'FirstPoint',
            })
        })
    })
})
