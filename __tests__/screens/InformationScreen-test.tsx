import InformationScreen from '../../src/screens/InformationScreen'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'

const mockOpenURL = jest.fn()
jest.mock('react-native/Libraries/Linking/Linking', () => {
    return {
        addEventListener: jest.fn(),
        openURL: mockOpenURL,
    }
})

describe('Information Screen', () => {
    beforeEach(() => {
        mockOpenURL.mockClear()
    })

    it('renders correctly', () => {
        const date = new Date().getFullYear()
        render(
            <NavigationContainer>
                <InformationScreen />
            </NavigationContainer>,
        )

        expect(screen.getByText(`© ${date} The Ultmt App`)).toBeTruthy()
    })

    it('presses developer email', () => {
        render(
            <NavigationContainer>
                <InformationScreen />
            </NavigationContainer>,
        )

        const emailButton = screen.getByText('developer@theultmtapp.com')
        fireEvent.press(emailButton)

        expect(mockOpenURL).toHaveBeenCalled()
    })

    it('presses buy me a disc button', () => {
        render(
            <NavigationContainer>
                <InformationScreen />
            </NavigationContainer>,
        )

        const bmadButton = screen.getByText('Buy Me a Disc')
        fireEvent.press(bmadButton)

        expect(mockOpenURL).toHaveBeenCalled()
    })
})
