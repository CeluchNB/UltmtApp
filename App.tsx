/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import * as React from 'react'
import CreateAccountScreen from './src/screens/CreateAccountScreen'
import CreateTeamScreen from './src/screens/CreateTeamScreen'
import LoginScreen from './src/screens/LoginScreen'
import ManageTeamDetailsScreen from './src/screens/ManageTeamDetailsScreen'
import ManageTeamsScreen from './src/screens/ManageTeamsScreen'
import { NavigationContainer } from '@react-navigation/native'
import ProfileScreen from './src/screens/ProfileScreen'
import RequestTeamScreen from './src/screens/RequestTeamScreen'
import RequestUserScreen from './src/screens/RequestUserScreen'
import RolloverTeamScreen from './src/screens/RolloverTeamScreen'
import { RootStackParamList } from './src/types/navigation'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<RootStackParamList>()

const App: React.FC<{}> = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={'Login'}
                screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen
                    name="CreateAccount"
                    component={CreateAccountScreen}
                />
                <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
                <Stack.Screen
                    name="ManageTeams"
                    component={ManageTeamsScreen}
                />
                <Stack.Screen
                    name="RequestTeam"
                    component={RequestTeamScreen}
                />
                <Stack.Screen
                    name="TeamDetails"
                    component={ManageTeamDetailsScreen}
                    initialParams={{ id: '', place: '', name: '' }}
                />
                <Stack.Screen
                    name="RequestUser"
                    component={RequestUserScreen}
                    initialParams={{ id: '' }}
                />
                <Stack.Screen
                    name="RolloverTeam"
                    component={RolloverTeamScreen}
                    initialParams={{ id: '' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default App
