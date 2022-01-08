/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import LoginScreen from './src/screens/LoginScreen'
import { NavigationContainer } from '@react-navigation/native'
import ProfileScreen from './src/screens/ProfileScreen'
import React from 'react'
import { RootStackParamList } from './src/types/navigation'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import store from './src/store/store'

const Stack = createNativeStackNavigator<RootStackParamList>()

const App: React.FC<{}> = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={
                    store.getState().account.token.length > 0
                        ? 'Profile'
                        : 'Login'
                }
                screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default App
