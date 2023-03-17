import ActionDisplayMediator from '../../../src/components/molecules/ActionDisplayMediator'
import { ActionFactory } from '../../../src/types/action'
import React from 'react'
import { game, liveAction } from '../../../fixtures/data'
import { render, screen } from '@testing-library/react-native'

jest.mock('react-native-google-mobile-ads', () => {
    return {
        default: { initialize: jest.fn(), setRequestConfiguration: jest.fn() },
        MaxAdsContentRating: { T: 'T', PG: 'PG' },
        BannerAd: () => <div aria-label="ad">Ad</div>,
        BannerAdSize: { BANNER: 'banner' },
        TestIds: { BANNER: 'bannertest' },
    }
})

describe('ActionDisplayMediator', () => {
    it('renders with action', () => {
        render(
            <ActionDisplayMediator
                action={ActionFactory.createFromAction(liveAction)}
                onPress={jest.fn()}
                teamOne={game.teamOne}
                teamTwo={game.teamTwo}
            />,
        )
        expect(screen.getByText('ib')).toBeTruthy()
    })

    it('renders with ad', () => {
        const snapshot = render(
            <ActionDisplayMediator
                action={{ ad: true }}
                onPress={jest.fn()}
                teamOne={game.teamOne}
                teamTwo={game.teamTwo}
            />,
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })
})
