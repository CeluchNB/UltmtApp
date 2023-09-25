import CreateGameScreen from './src/screens/games/CreateGameScreen'
import CreateTournamentScreen from './src/screens/games/CreateTournamentScreen'
import InformationScreen from './src/screens/InformationScreen'
import JoinGameScreen from './src/screens/games/JoinGameScreen'
import LiveGameNavigator from './src/navigation/LiveGameNavigator'
import React from 'react'
import SearchTournamentScreen from './src/screens/games/SearchTournamentScreen'
import SecureEditScreen from './src/screens/SecureEditScreen'
import SelectMyTeamScreen from './src/screens/games/SelectMyTeamScreen'
import SelectOpponentScreen from './src/screens/games/SelectOpponentScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import TabNavigator from './src/navigation/TabNavigator'
import { TopLevelParamList } from './src/types/navigation'
import { closeRealm } from './src/models/realm'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from './src/hooks'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
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

    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: colors.primary,
        },
    }

    return (
        <NavigationContainer theme={MyTheme}>
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
                    <Stack.Group
                        screenOptions={({ route }) => {
                            return {
                                headerShown: true,
                                headerStyle: {
                                    backgroundColor: colors.primary,
                                },
                                headerTintColor: colors.textPrimary,
                                title: route.name.split(/(?=[A-Z])/).join(' '),
                            }
                        }}>
                        <Stack.Screen
                            name="SelectMyTeam"
                            component={SelectMyTeamScreen}
                            options={{
                                headerBackTitleVisible: true,
                                headerBackTitle: 'Back',
                            }}
                        />
                        <Stack.Screen
                            name="SelectOpponent"
                            component={SelectOpponentScreen}
                        />
                        <Stack.Screen
                            name="SearchTournaments"
                            component={SearchTournamentScreen}
                        />
                        <Stack.Screen
                            name="CreateTournament"
                            component={CreateTournamentScreen}
                            initialParams={{ name: '' }}
                        />
                        <Stack.Screen
                            name="JoinGame"
                            component={JoinGameScreen}
                        />
                        <Stack.Screen
                            name="CreateGame"
                            component={CreateGameScreen}
                            options={{ title: '' }}
                        />
                    </Stack.Group>
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
