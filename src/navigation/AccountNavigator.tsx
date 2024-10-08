import * as React from 'react'
import { AccountStackParamList } from './../types/navigation'
import AddGuestScreen from '../screens/teams/AddGuestScreen'
import CreateAccountScreen from './../screens/CreateAccountScreen'
import CreateTeamScreen from './../screens/CreateTeamScreen'
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'
import JoinByCodeScreen from '../screens/JoinByCodeScreen'
import LoginScreen from './../screens/LoginScreen'
import ManageTeamDetailsScreen from './../screens/ManageTeamDetailsScreen'
import ManageTeamsScreen from './../screens/ManageTeamsScreen'
import OfflineGameOptionsScreen from '../screens/games/OfflineGameOptionsScreen'
import ProfileScreen from './../screens/ProfileScreen'
import RequestTeamScreen from './../screens/RequestTeamScreen'
import { RequestType } from './../types/request'
import RequestUserScreen from './../screens/RequestUserScreen'
import ResetPasswordScreen from '../screens/ResetPasswordScreen'
import RolloverTeamScreen from './../screens/RolloverTeamScreen'
import TeamRequestsScreen from '../screens/TeamRequestsScreen'
import TeamSettingsScreen from '../screens/teams/TeamSettingsScreen'
import UserRequestsScreen from '../screens/UserRequestsScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useTheme } from '../hooks'

import { getStack } from './SharedNavigator'

const Stack = createNativeStackNavigator<AccountStackParamList>()

const AccountNavigator: React.FC<{}> = () => {
    const {
        theme: { colors },
    } = useTheme()

    const common = getStack(Stack)

    return (
        <Stack.Navigator
            initialRouteName={'Login'}
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
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CreateAccount"
                component={CreateAccountScreen}
            />
            <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
            <Stack.Screen name="ManageTeams" component={ManageTeamsScreen} />
            <Stack.Screen name="RequestTeam" component={RequestTeamScreen} />
            <Stack.Screen
                name="ManagedTeamDetails"
                component={ManageTeamDetailsScreen}
                initialParams={{ id: '' }}
            />
            <Stack.Screen name="TeamSettings" component={TeamSettingsScreen} />
            <Stack.Screen
                name="RequestUser"
                component={RequestUserScreen}
                initialParams={{ type: RequestType.PLAYER }}
            />
            <Stack.Screen
                name="AddGuest"
                component={AddGuestScreen}
                initialParams={{ teamId: '' }}
            />
            <Stack.Screen
                name="RolloverTeam"
                component={RolloverTeamScreen}
                options={{ headerBackTitle: 'Settings' }}
            />
            <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
            />
            <Stack.Screen
                name="ResetPassword"
                component={ResetPasswordScreen}
            />
            <Stack.Screen
                name="UserRequests"
                component={UserRequestsScreen}
                options={{ title: 'My Requests' }}
            />
            <Stack.Screen name="TeamRequests" component={TeamRequestsScreen} />
            <Stack.Screen name="JoinByCode" component={JoinByCodeScreen} />
            <Stack.Screen
                name="OfflineGameOptions"
                component={OfflineGameOptionsScreen}
                options={{ title: '' }}
            />
            {common}
        </Stack.Navigator>
    )
}

export default AccountNavigator
