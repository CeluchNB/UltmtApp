import EditGameScreen from '../screens/games/EditGameScreen'
import FirstPointScreen from '../screens/games/FirstPointScreen'
import { LiveGameParamList } from '../types/navigation'
import LivePointEditScreen from '../screens/games/LivePointEditScreen'
import React from 'react'
import SelectPlayersScreen from '../screens/games/SelectPlayersScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<LiveGameParamList>()

const LiveGameNavigator: React.FC<{}> = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FirstPoint" component={FirstPointScreen} />
            <Stack.Screen
                name="SelectPlayers"
                component={SelectPlayersScreen}
            />
            <Stack.Screen
                name="LivePointEdit"
                component={LivePointEditScreen}
            />
            <Stack.Screen name="EditGame" component={EditGameScreen} />
        </Stack.Navigator>
    )
}

export default LiveGameNavigator
