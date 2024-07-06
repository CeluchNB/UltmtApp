import * as PointData from '../../../src/services/data/point'
import { FirstPointProps } from '../../../src/types/navigation'
import FirstPointScreen from '../../../src/screens/games/FirstPointScreen'
import { NavigationContainer } from '@react-navigation/native'
import Point from '../../../src/types/point'
import { Provider } from 'react-redux'
import React from 'react'
import { game } from '../../../fixtures/data'
import store from '../../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const props: FirstPointProps = {
    navigation: {
        navigate,
    } as any,
    route: {} as any,
}

it('should match snapshot with data', () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <FirstPointScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )
    expect(snapshot.getByText('111111')).not.toBeNull()
    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should handle pulling press', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <FirstPointScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const pullBtn = getByText('pulling')
    fireEvent.press(pullBtn)
    await waitFor(() => {
        expect(navigate).toHaveBeenCalled()
    })
})

it('should handle receiving press', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <FirstPointScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const pullBtn = getByText('receiving')
    fireEvent.press(pullBtn)
    await waitFor(() => {
        expect(navigate).toHaveBeenCalled()
    })
})

it('with error', async () => {
    const { getByText, findByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <FirstPointScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const pullBtn = getByText('pulling')
    fireEvent.press(pullBtn)
    const errorMessage = await findByText('Bad stuff')
    expect(errorMessage).not.toBeNull()
})
