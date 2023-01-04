/**
 * @format
 */

import * as React from 'react'
import App from './App'
import { AppRegistry } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper'
import { Provider } from 'react-redux'
import { name as appName } from './app.json'
import store from './src/store/store'

const Root = () => (
    <Provider store={store}>
        <PaperProvider>
            <App />
        </PaperProvider>
    </Provider>
)

AppRegistry.registerComponent(appName, () => Root)
