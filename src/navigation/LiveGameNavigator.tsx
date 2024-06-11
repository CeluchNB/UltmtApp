import EditGameScreen from '../screens/games/EditGameScreen'
import FirstPointScreen from '../screens/games/FirstPointScreen'
import LiveGameEditScreen from '../screens/live-games/LiveGameEdit'
import { LiveGameParamList } from '../types/navigation'
import LivePointEditScreen from '../screens/games/LivePointEditScreen'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../hooks'

const Stack = createNativeStackNavigator<LiveGameParamList>()

const LiveGameNavigator: React.FC<{}> = () => {
    const {
        theme: { colors },
    } = useTheme()

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FirstPoint" component={FirstPointScreen} />
            <Stack.Screen
                name="LivePointEdit"
                component={LivePointEditScreen}
            />
            <Stack.Screen
                name="EditGame"
                component={EditGameScreen}
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.textPrimary,
                    title: 'Edit Game',
                    headerBackTitle: 'Back',
                }}
            />
            <Stack.Screen
                name="LiveGameEdit"
                component={LiveGameEditScreen}
                initialParams={{ gameId: '' }}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}

export default LiveGameNavigator
