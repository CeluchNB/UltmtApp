import * as UserServices from '../../src/store/services/user'
import LoginScreen from '../../src/screens/LoginScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import renderer from 'react-test-renderer'
import store from '../../src/store/store'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const props: Props = {
    navigation: {
        navigate: jest.fn(),
    } as any,
    route: {} as any,
}

it('test matches snapshot', () => {
    const tree = renderer
        .create(
            <Provider store={store}>
                <LoginScreen {...props} />
            </Provider>,
        )
        .toJSON()
    expect(tree).toMatchSnapshot()
})

it('test successful login', async () => {
    jest.spyOn(UserServices, 'login').mockImplementationOnce(async () => {
        return { data: { token: 'asdf.asdf.asdf' } }
    })
    const { getByPlaceholderText, getAllByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <LoginScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await act(async () => {
        fireEvent.changeText(getByPlaceholderText('Username'), 'user')
        fireEvent.changeText(getByPlaceholderText('Password'), 'pass')
        fireEvent.press(getAllByText('Login')[1])
    })

    expect(props.navigation.navigate).toHaveBeenCalled()
})
