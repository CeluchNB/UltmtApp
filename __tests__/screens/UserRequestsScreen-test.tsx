import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import UserRequestsScreen from '../../src/screens/UserRequestsScreen'
import { fetchProfileData } from '../../fixtures/data'
import store from '../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import {
    setProfile,
    setToken,
} from '../../src/store/reducers/features/account/accountReducer'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const addListener = jest.fn().mockReturnValue(() => {})
const token = 'token.1234.token'

const props: Props = {
    navigation: {
        navigate,
        addListener,
    } as any,
    route: {} as any,
}

beforeAll(() => {
    store.dispatch(setProfile(fetchProfileData))
    store.dispatch(setToken(token))
})

beforeEach(() => {
    jest.clearAllMocks()
})

it('should match snapshot', async () => {
    const snapshot = render(
        <Provider store={store}>
            <NavigationContainer>
                <UserRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should handle toggle roster status click', async () => {
    const spy = jest
        .spyOn(UserData, 'setOpenToRequests')
        .mockReturnValueOnce(
            Promise.resolve({ ...fetchProfileData, openToRequests: false }),
        )
    const { getByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <UserRequestsScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )
    fireEvent.press(getByText('allow requests'))
    await waitFor(() => queryByText('prevent requests'))
    expect(spy).toHaveBeenCalledWith(token, true)
})
