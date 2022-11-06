import * as React from 'react'
import GameCreationNavigator from './src/navigation/GameCreationNavigator'
import { NavigationContainer } from '@react-navigation/native'
import SecureEditScreen from './src/screens/SecureEditScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import TabNavigator from './src/navigation/TabNavigator'
import { TopLevelParamList } from './src/types/navigation'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { QueryClient, QueryClientProvider } from 'react-query'

const Stack = createNativeStackNavigator<TopLevelParamList>()

const queryClient = new QueryClient()

const App: React.FC<{}> = () => {
    return (
        <NavigationContainer>
            <QueryClientProvider client={queryClient}>
                {/* Settings Screen exists here for dark mode purposes */}
                <Stack.Navigator
                    initialRouteName={'Tabs'}
                    screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Tabs" component={TabNavigator} />
                    <Stack.Screen
                        name="SettingsScreen"
                        component={SettingsScreen}
                    />
                    <Stack.Screen
                        name="SecureEditScreen"
                        component={SecureEditScreen}
                    />
                    <Stack.Screen
                        name="GameCreationFlow"
                        component={GameCreationNavigator}
                    />
                </Stack.Navigator>
            </QueryClientProvider>
        </NavigationContainer>
    )
}

export default App
