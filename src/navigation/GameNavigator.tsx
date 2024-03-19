import * as React from 'react'
import GameHomeScreen from '../screens/games/GameHomeScreen'
import GameSearchScreen from '../screens/games/GameSearchScreen'
import { GameStackParamList } from '../types/navigation'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../hooks'

import { getStack } from './SharedNavigator'

const Stack = createNativeStackNavigator<GameStackParamList>()

const GameNavigator: React.FC<{}> = () => {
    const {
        theme: { colors },
    } = useTheme()

    const common = getStack(Stack)

    return (
        <Stack.Navigator
            initialRouteName={'GameHome'}
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.textPrimary,
            }}>
            <Stack.Screen
                name="GameHome"
                component={GameHomeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="GameSearch"
                component={GameSearchScreen}
                options={{ title: '', headerBackTitle: 'Home' }}
            />
            {common}
        </Stack.Navigator>
    )
}

export default GameNavigator
