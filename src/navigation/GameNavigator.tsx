import * as React from 'react'
import CreateGameScreen from '../screens/games/CreateGameScreen'
import GameHomeScreen from '../screens/games/GameHomeScreen'
import GameSearchScreen from '../screens/games/GameSearchScreen'
import { GameStackParamList } from '../types/navigation'
import SelectMyTeamScreen from '../screens/games/SelectMyTeamScreen'
import SelectOpponentScreen from '../screens/games/SelectOpponentScreen'
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
            <Stack.Screen name="SelectMyTeam" component={SelectMyTeamScreen} />
            <Stack.Screen
                name="SelectOpponent"
                component={SelectOpponentScreen}
            />
        </Stack.Navigator>
    )
}

export default GameNavigator
