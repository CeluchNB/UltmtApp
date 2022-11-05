import * as React from 'react'
import GameHomeScreen from '../screens/games/GameHomeScreen'
import GameSearchScreen from '../screens/games/GameSearchScreen'
import { GameStackParamList } from '../types/navigation'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<GameStackParamList>()

const GameNavigator: React.FC<{}> = () => {
    return (
        <Stack.Navigator
            initialRouteName={'GameHome'}
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GameHome" component={GameHomeScreen} />
            <Stack.Screen name="GameSearch" component={GameSearchScreen} />
        </Stack.Navigator>
    )
}

export default GameNavigator
