import GameCreationNavigator from './src/navigation/GameCreationNavigator'
import InformationScreen from './src/screens/InformationScreen'
import LiveGameNavigator from './src/navigation/LiveGameNavigator'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import SecureEditScreen from './src/screens/SecureEditScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import TabNavigator from './src/navigation/TabNavigator'
import { TopLevelParamList } from './src/types/navigation'
import { closeRealm } from './src/models/realm'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from './src/hooks'
import { QueryClient, QueryClientProvider } from 'react-query'

const Stack = createNativeStackNavigator<TopLevelParamList>()
const queryClient = new QueryClient()

const App: React.FC<{}> = () => {
    const {
        theme: { colors },
    } = useTheme()

    React.useEffect(() => {
        return () => {
            closeRealm()
        }
    }, [])
    return (
        <NavigationContainer>
            <QueryClientProvider client={queryClient}>
                {/* Settings Screen exists here for dark mode purposes */}
                <Stack.Navigator
                    initialRouteName={'Tabs'}
                    screenOptions={{
                        headerShown: false,
                    }}>
                    <Stack.Screen name="Tabs" component={TabNavigator} />
                    <Stack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{
                            title: 'Settings',
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: colors.primary,
                            },
                            headerTintColor: colors.textPrimary,
                            headerBackTitle: 'Back',
                        }}
                    />
                    <Stack.Screen
                        name="SecureEdit"
                        component={SecureEditScreen}
                        options={{
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: colors.primary,
                            },
                            headerTintColor: colors.textPrimary,
                            headerBackTitle: 'Back',
                        }}
                    />
                    <Stack.Screen
                        name="GameCreationFlow"
                        component={GameCreationNavigator}
                    />
                    <Stack.Screen
                        name="LiveGame"
                        component={LiveGameNavigator}
                    />
                    <Stack.Screen
                        name="Information"
                        component={InformationScreen}
                        options={{
                            title: 'More Info',
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: colors.primary,
                            },
                            headerTintColor: colors.textPrimary,
                        }}
                    />
                </Stack.Navigator>
            </QueryClientProvider>
        </NavigationContainer>
    )
}

export default App
