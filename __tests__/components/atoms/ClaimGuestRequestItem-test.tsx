import { ClaimGuestRequest } from '../../../src/types/claim-guest-request'
import ClaimGuestRequestItem from '../../../src/components/atoms/ClaimGuestRequestItem'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'

describe('ClaimGuestRequestItem', () => {
    const request: ClaimGuestRequest = {
        _id: 'request',
        userId: 'user',
        guestId: 'guest',
        teamId: 'team',
        user: {
            _id: 'user',
            firstName: 'Noah',
            lastName: 'Celuch',
            username: 'noah',
        },
        guest: {
            _id: 'guest',
            firstName: 'Noah',
            lastName: 'Celuch',
            username: 'guest',
        },
        team: {
            _id: 'team',
            place: 'Hazard',
            name: 'Temper',
            teamname: 'hazard',
            seasonStart: '2023',
            seasonEnd: '2023',
        },
        status: 'pending',
    }
    it('renders correctly', async () => {
        render(
            <NavigationContainer>
                <ClaimGuestRequestItem
                    request={request}
                    onAccept={jest.fn()}
                    onDeny={jest.fn()}
                />
            </NavigationContainer>,
        )

        expect(screen.debug()).toMatchSnapshot()
    })

    it('calls accept', async () => {
        const onAccept = jest.fn()
        render(
            <NavigationContainer>
                <ClaimGuestRequestItem
                    request={request}
                    onAccept={onAccept}
                    onDeny={jest.fn()}
                />
            </NavigationContainer>,
        )

        const acceptButton = screen.getByTestId('accept-button')
        fireEvent.press(acceptButton)

        expect(onAccept).toHaveBeenCalled()
    })

    it('calls deny', async () => {
        const onDeny = jest.fn()
        render(
            <NavigationContainer>
                <ClaimGuestRequestItem
                    request={request}
                    onAccept={jest.fn()}
                    onDeny={onDeny}
                />
            </NavigationContainer>,
        )

        const denyButton = screen.getByTestId('delete-button')
        fireEvent.press(denyButton)

        expect(onDeny).toHaveBeenCalled()
    })
})
