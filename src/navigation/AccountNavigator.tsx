import * as React from 'react'
import { AccountStackParamList } from './../types/navigation'
import CreateAccountScreen from './../screens/CreateAccountScreen'
import CreateTeamScreen from './../screens/CreateTeamScreen'
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'
import LoginScreen from './../screens/LoginScreen'
import ManageTeamDetailsScreen from './../screens/ManageTeamDetailsScreen'
import ManageTeamsScreen from './../screens/ManageTeamsScreen'
import ProfileScreen from './../screens/ProfileScreen'
import PublicTeamScreen from './../screens/PublicTeamScreen'
import PublicUserScreen from './../screens/PublicUserScreen'
import RequestTeamScreen from './../screens/RequestTeamScreen'
import { RequestType } from './../types/request'
import RequestUserScreen from './../screens/RequestUserScreen'
import ResetPasswordScreen from '../screens/ResetPasswordScreen'
import RolloverTeamScreen from './../screens/RolloverTeamScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<AccountStackParamList>()

const AccountNavigator: React.FC<{}> = () => {
    return (
        <Stack.Navigator
            initialRouteName={'Login'}
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
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
                initialParams={{ id: '', place: '', name: '' }}
            />
            <Stack.Screen
                name="PublicTeamDetails"
                component={PublicTeamScreen}
                initialParams={{ id: '', place: '', name: '' }}
            />
            <Stack.Screen
                name="RequestUser"
                component={RequestUserScreen}
                initialParams={{ type: RequestType.PLAYER }}
            />
            <Stack.Screen
                name="RolloverTeam"
                component={RolloverTeamScreen}
                initialParams={{ hasPendingRequests: false }}
            />
            <Stack.Screen
                name="PublicUserDetails"
                component={PublicUserScreen}
                initialParams={{
                    user: {
                        _id: '',
                        firstName: '',
                        lastName: '',
                        username: '',
                    },
                }}
            />
            <Stack.Screen
                name="ForgotPasswordScreen"
                component={ForgotPasswordScreen}
            />
            <Stack.Screen
                name="ResetPasswordScreen"
                component={ResetPasswordScreen}
            />
        </Stack.Navigator>
    )
}

export default AccountNavigator
