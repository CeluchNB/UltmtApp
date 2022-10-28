import * as GameServices from '../../src/services/data/game'
import GameHomeScreen from '../../src/screens/GameHomeScreen'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { game } from '../../fixtures/data'
import { render } from '@testing-library/react-native'
import { waitUntilRefreshComplete } from '../../fixtures/utils'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('../../src/components/atoms/GameCard', () => () => {
    return <div>Game</div>
})

const props = {
    navigation: {
        navigate: jest.fn(),
    } as any,
    route: {} as any,
}

beforeEach(() => {
    jest.spyOn(GameServices, 'searchGames').mockReturnValueOnce(
        Promise.resolve([
            game,
            {
                ...game,
                _id: 'game2',
                teamTwo: { name: 'Team 7' },
                teamTwoScore: 7,
            },
        ]),
    )
})

it('should match snapshot with live and recent data', async () => {
    const snapshot = render(
        <NavigationContainer>
            <GameHomeScreen {...props} />
        </NavigationContainer>,
    )

    await waitUntilRefreshComplete(
        snapshot.getByTestId('game-home-scroll-view'),
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should match snapshot with no data', async () => {
    jest.spyOn(GameServices, 'searchGames')
        .mockReset()
        .mockReturnValueOnce(Promise.resolve([]))

    const snapshot = render(
        <NavigationContainer>
            <GameHomeScreen {...props} />
        </NavigationContainer>,
    )

    await waitUntilRefreshComplete(
        snapshot.getByTestId('game-home-scroll-view'),
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})
