import * as AdUtils from '../../../src/utils/ads'
import * as GameServices from '../../../src/services/data/game'
import GameHomeScreen from '../../../src/screens/games/GameHomeScreen'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { game } from '../../../fixtures/data'
import { render } from '@testing-library/react-native'
import { waitUntilRefreshComplete } from '../../../fixtures/utils'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
jest.mock('../../../src/components/atoms/GameCard', () => () => {
    return <div>Game</div>
})

jest.mock('react-native-permissions', () => {
    return {
        PERMISSIONS: {},
        RESULTS: {},
        check: jest.fn(),
        checkLocationAccuracy: jest.fn(),
        checkMultiple: jest.fn(),
        checkNotifications: jest.fn(),
        openLimitedPhotoLibraryPicker: jest.fn(),
        openSettings: jest.fn(),
        request: jest.fn(),
        requestLocationAccuracy: jest.fn(),
        requestMultiple: jest.fn(),
        requestNotifications: jest.fn(),
    }
})
jest.mock('react-native-google-mobile-ads', () => {
    return {
        default: { initialize: jest.fn(), setRequestConfiguration: jest.fn() },
        MaxAdsContentRating: { T: 'T', PG: 'PG' },
    }
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
    jest.spyOn(AdUtils, 'setupMobileAds').mockReturnValue(Promise.resolve())
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
