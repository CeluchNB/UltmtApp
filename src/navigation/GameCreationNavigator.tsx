import CreateGameScreen from '../screens/games/CreateGameScreen'
import { GameCreationParamList } from '../types/navigation'
import JoinGameScreen from '../screens/games/JoinGameScreen'
import React from 'react'
import SelectMyTeamScreen from '../screens/games/SelectMyTeamScreen'
import SelectOpponentScreen from '../screens/games/SelectOpponentScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../hooks'

const Stack = createNativeStackNavigator<GameCreationParamList>()

const GameCreationNavigator: React.FC<{}> = () => {
    const {
        theme: { colors },
    } = useTheme()

    return (
        <Stack.Navigator
            screenOptions={({ route }) => {
                return {
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.textPrimary,
                    title: route.name.split(/(?=[A-Z])/).join(' '),
                }
            }}>
            <Stack.Screen
                name="SelectMyTeam"
                component={SelectMyTeamScreen}
                options={{}}
            />
            <Stack.Screen
                name="SelectOpponent"
                component={SelectOpponentScreen}
            />
            <Stack.Screen name="JoinGame" component={JoinGameScreen} />
            <Stack.Screen
                name="CreateGame"
                component={CreateGameScreen}
                options={{ title: '' }}
            />
        </Stack.Navigator>
    )
}

export default GameCreationNavigator
