import * as GameData from '../../../src/services/data/game'
import { EditGameProps } from '../../../src/types/navigation'
import EditGameScreen from '../../../src/screens/games/EditGameScreen'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { RealmProvider } from '../../../src/context/realm'
import { game } from '../../../fixtures/data'
import { QueryClient, QueryClientProvider } from 'react-query'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const goBack = jest.fn()
const props: EditGameProps = {
    navigation: {
        goBack,
    } as any,
    route: { params: { gameId: '' } } as any,
}

beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
})

afterAll(() => {
    jest.useRealTimers()
})

const client = new QueryClient()

describe('EditGameScreen', () => {
    it('matches snapshot', () => {
        const snapshot = render(
            <RealmProvider>
                <QueryClientProvider client={client}>
                    <NavigationContainer>
                        <EditGameScreen {...props} />
                    </NavigationContainer>
                </QueryClientProvider>
            </RealmProvider>,
        )

        expect(snapshot.getByText('Game to')).toBeTruthy()
        expect(snapshot.getByText('Half at')).toBeTruthy()
        expect(snapshot.getByText('make updates')).toBeTruthy()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    // it('handles update press', async () => {
    //     const { getByText } = render(
    //         <NavigationContainer>
    //             <EditGameScreen {...props} />
    //         </NavigationContainer>,
    //     )

    //     const updateBtn = getByText('make updates')
    //     fireEvent.press(updateBtn)

    //     expect(goBack).toHaveBeenCalled()
    // })
})
