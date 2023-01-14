import * as GameData from '../../src/services/data/game'
import { ActiveGamesProps } from '../../src/types/navigation'
import ActiveGamesScreen from '../../src/screens/ActiveGamesScreen'
import { Game } from '../../src/types/game'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { fetchProfileData, game } from '../../fixtures/data'
import { render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const createGame = (overrides: Partial<Game>): Game => {
    return {
        ...game,
        ...overrides,
    }
}

const props: ActiveGamesProps = {
    navigation: {} as any,
    route: {} as any,
}

beforeEach(() => {
    store.dispatch(setProfile(fetchProfileData))
    jest.spyOn(GameData, 'getActiveGames').mockReturnValue(
        Promise.resolve([
            createGame({
                creator: {
                    _id: fetchProfileData._id,
                    firstName: fetchProfileData.firstName,
                    lastName: fetchProfileData.lastName,
                    username: fetchProfileData.username,
                },
            }),
            createGame({
                creator: {
                    _id: 'otheruser',
                    firstName: fetchProfileData.firstName,
                    lastName: fetchProfileData.lastName,
                    username: fetchProfileData.username,
                },
            }),
        ]),
    )
})

describe('ActiveGamesScreen', () => {
    it('renders', async () => {
        const snapshot = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ActiveGamesScreen {...props} />
                </NavigationContainer>
            </Provider>,
        )

        await waitFor(async () => {
            expect(
                snapshot.getByText(
                    `vs. ${game.teamOne.place} ${game.teamOne.name}`,
                ),
            ).toBeTruthy()
        })

        expect(snapshot.getByText(`vs. ${game.teamTwo.name}`)).toBeTruthy()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })
})
