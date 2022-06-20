import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import SecureEditScreen from './src/screens/SecureEditScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import TabNavigator from './src/navigation/TabNavigator'
import { TopLevelParamList } from './src/types/navigation'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<TopLevelParamList>()

const App: React.FC<{}> = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={'Tabs'}
                screenOptions={{ headerShown: false }}>
                <Stack.Screen
                    name="SettingsScreen"
                    component={SettingsScreen}
                />
                <Stack.Screen
                    name="SecureEditScreen"
                    component={SecureEditScreen}
                />
                <Stack.Screen name="Tabs" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default App
