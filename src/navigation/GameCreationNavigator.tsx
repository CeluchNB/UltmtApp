import CreateGameScreen from '../screens/games/CreateGameScreen'
import { GameStackParamList } from '../types/navigation'
import React from 'react'
import SelectMyTeamScreen from '../screens/games/SelectMyTeamScreen'
import SelectOpponentScreen from '../screens/games/SelectOpponentScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<GameStackParamList>()

const GameCreationNavigator: React.FC<{}> = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SelectMyTeam" component={SelectMyTeamScreen} />
            <Stack.Screen
                name="SelectOpponent"
                component={SelectOpponentScreen}
            />
            <Stack.Screen name="CreateGame" component={CreateGameScreen} />
        </Stack.Navigator>
    )
}

export default GameCreationNavigator
