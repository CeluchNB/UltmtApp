import * as PointData from '../../../src/services/data/point'
import { LiveGameProps } from '../../../src/types/navigation'
import FirstPointScreen from '../../../src/screens/games/FirstPointScreen'
import { NavigationContainer } from '@react-navigation/native'
import Point from '../../../src/types/point'
import { Provider } from 'react-redux'
import React from 'react'
// import { createPoint } from '../../../src/store/reducers/features/point/livePointReducer'
import { game } from '../../../fixtures/data'
import { setGame } from '../../../src/store/reducers/features/game/liveGameReducer'
import store from '../../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const props: LiveGameProps = {
    navigation: {
        navigate,
    } as any,
    route: {} as any,
}

const spy = jest.spyOn(PointData, 'createPoint')

beforeAll(() => {
    store.dispatch(
        setGame({ ...game, startTime: '2022', tournament: undefined }),
    )
})

afterEach(() => {
    spy.mockClear()
})

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
    spy.mockReturnValueOnce(Promise.resolve({} as Point))

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

    expect(spy).toHaveBeenCalledWith(true, 1)
})

it('should handle receiving press', async () => {
    spy.mockReturnValueOnce(Promise.resolve({} as Point))

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

    expect(spy).toHaveBeenCalledWith(false, 1)
})

it('with error', async () => {
    spy.mockReturnValueOnce(Promise.reject({ message: 'Bad stuff' }))

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
