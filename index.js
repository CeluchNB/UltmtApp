/**
 * @format
 */

import * as React from 'react'
import { AppRegistry } from 'react-native'
import LoginScreen from './src/screens/LoginScreen'
import { Provider } from 'react-redux'
import { name as appName } from './app.json'
import store from './src/store/store'

const Root = () => (
    <Provider store={store}>
        <LoginScreen />
    </Provider>
)

AppRegistry.registerComponent(appName, () => Root)
