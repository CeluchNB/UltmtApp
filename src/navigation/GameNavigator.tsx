import * as React from 'react'
import CommentScreen from '../screens/games/CommentScreen'
import GameHomeScreen from '../screens/games/GameHomeScreen'
import GameSearchScreen from '../screens/games/GameSearchScreen'
import { GameStackParamList } from '../types/navigation'
import ViewGameScreen from '../screens/games/ViewGameScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../hooks'

const Stack = createNativeStackNavigator<GameStackParamList>()

const GameNavigator: React.FC<{}> = () => {
    const {
        theme: { colors },
    } = useTheme()

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
                options={{ title: '' }}
            />
            <Stack.Screen
                name="ViewGame"
                component={ViewGameScreen}
                options={{
                    title: '',
                }}
            />
            <Stack.Screen
                name="Comment"
                component={CommentScreen}
                options={{
                    headerBackTitle: 'Back',
                    title: 'Comments',
                }}
            />
        </Stack.Navigator>
    )
}

export default GameNavigator
