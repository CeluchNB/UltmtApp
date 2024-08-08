/**
 * @format
 */

import 'react-native-get-random-values'
import * as React from 'react'
import App from './App'
import { AppRegistry } from 'react-native'
import { Provider } from 'react-redux'
import { RealmProvider } from './src/context/realm'
import { ThemeProvider } from './src/theme/context'
import { name as appName } from './app.json'
import store from './src/store/store'
import { Provider as PaperProvider, useTheme } from 'react-native-paper'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

const Root = () => {
    const theme = useTheme()

    return (
        <RealmProvider>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <PaperProvider
                            theme={{
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    secondaryContainer: 'transparent',
                                },
                            }}>
                            <App />
                        </PaperProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </Provider>
        </RealmProvider>
    )
}

AppRegistry.registerComponent(appName, () => Root)
