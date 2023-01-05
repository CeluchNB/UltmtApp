/**
 * @format
 */

import * as React from 'react'
import App from './App'
import { AppRegistry } from 'react-native'
import { Provider } from 'react-redux'
import { name as appName } from './app.json'
import store from './src/store/store'
import { Provider as PaperProvider, useTheme } from 'react-native-paper'

const Root = () => {
    const theme = useTheme()

    return (
        <Provider store={store}>
            <PaperProvider theme={{...theme, colors: { ...theme.colors, secondaryContainer: 'transparent' } }}>
                <App />
            </PaperProvider>
        </Provider>
    )
}

AppRegistry.registerComponent(appName, () => Root)
