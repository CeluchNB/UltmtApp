import LoginScreen from '../../src/screens/LoginScreen'
import { Provider } from 'react-redux'
import React from 'react'
import renderer from 'react-test-renderer'
import store from '../../src/store/store'

it('test matches snapshot', () => {
    const tree = renderer
        .create(
            <Provider store={store}>
                <LoginScreen />
            </Provider>,
        )
        .toJSON()
    expect(tree).toMatchSnapshot()
})
