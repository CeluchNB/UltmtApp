import React from 'react'
import TournamentListItem from '../../../src/components/atoms/TournamentListItem'
import { tourney } from '../../../fixtures/data'
import { fireEvent, render } from '@testing-library/react-native'

describe('tournament list item', () => {
    it('renders successfully', () => {
        const { getByText } = render(
            <TournamentListItem tournament={tourney} onPress={jest.fn()} />,
        )
        expect(getByText(tourney.name)).toBeTruthy()
        expect(getByText(`@${tourney.eventId}`)).toBeTruthy()
    })

    it('handles press', async () => {
        const onPress = jest.fn()
        const { getByText } = render(
            <TournamentListItem tournament={tourney} onPress={onPress} />,
        )
        const item = getByText(tourney.name)
        fireEvent.press(item)

        expect(onPress).toHaveBeenCalled()
    })
})
