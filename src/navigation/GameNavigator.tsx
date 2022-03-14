import * as React from 'react'
import GameSearchScreen from '../screens/GameSearchScreen'
import { GameStackParamList } from '../types/navigation'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<GameStackParamList>()

const GameNavigator: React.FC<{}> = () => {
    return (
        <Stack.Navigator
            initialRouteName={'GameSearch'}
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GameSearch" component={GameSearchScreen} />
        </Stack.Navigator>
    )
}

export default GameNavigator
