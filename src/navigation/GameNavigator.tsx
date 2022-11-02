import * as React from 'react'
import CreateGameScreen from '../screens/CreateGameScreen'
import GameHomeScreen from '../screens/GameHomeScreen'
import GameSearchScreen from '../screens/GameSearchScreen'
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
            <Stack.Screen name="CreateGame" component={CreateGameScreen} />
        </Stack.Navigator>
    )
}

export default GameNavigator
