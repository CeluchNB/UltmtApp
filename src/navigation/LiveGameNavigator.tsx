import EditGameScreen from '../screens/games/EditGameScreen'
import FirstPointScreen from '../screens/games/FirstPointScreen'
import LineBuilder from '../screens/live-games/LineBuilder'
import LiveGameEditScreen from '../screens/live-games/LiveGameEdit'
import { LiveGameParamList } from '../types/navigation'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../hooks'

const Stack = createNativeStackNavigator<LiveGameParamList>()

const LiveGameNavigator: React.FC<{}> = () => {
    const {
        theme: { colors },
    } = useTheme()

    return (
        <Stack.Navigator>
            <Stack.Screen
                name="FirstPoint"
                component={FirstPointScreen}
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.textPrimary,
                    headerBackVisible: false,
                    title: 'First Point',
                }}
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
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.textPrimary,
                    headerTitle: 'Live Game',
                    headerBackVisible: false,
                }}
            />
            <Stack.Screen
                name="LineBuilder"
                component={LineBuilder}
                options={{
                    headerShown: true,
                    headerStyle: {
                        backgroundColor: colors.primary,
                    },
                    headerTintColor: colors.textPrimary,
                    title: 'Build Lines',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack.Navigator>
    )
}

export default LiveGameNavigator
