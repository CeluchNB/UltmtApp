import FirstPointScreen from '../screens/games/FirstPointScreen'
import { LiveGameParamList } from '../types/navigation'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<LiveGameParamList>()

const LiveGameNavigator: React.FC<{}> = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FirstPoint" component={FirstPointScreen} />
        </Stack.Navigator>
    )
}

export default LiveGameNavigator
