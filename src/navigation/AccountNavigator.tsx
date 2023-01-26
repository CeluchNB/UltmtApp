import * as React from 'react'
import { AccountStackParamList } from './../types/navigation'
import ActiveGamesScreen from '../screens/ActiveGamesScreen'
import CreateAccountScreen from './../screens/CreateAccountScreen'
import CreateTeamScreen from './../screens/CreateTeamScreen'
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'
import JoinByCodeScreen from '../screens/JoinByCodeScreen'
import LoginScreen from './../screens/LoginScreen'
import ManageTeamDetailsScreen from './../screens/ManageTeamDetailsScreen'
import ManageTeamsScreen from './../screens/ManageTeamsScreen'
import OfflineGameOptionsScreen from '../screens/games/OfflineGameOptionsScreen'
import ProfileScreen from './../screens/ProfileScreen'
import PublicTeamScreen from './../screens/PublicTeamScreen'
import PublicUserScreen from './../screens/PublicUserScreen'
import RequestTeamScreen from './../screens/RequestTeamScreen'
import { RequestType } from './../types/request'
import RequestUserScreen from './../screens/RequestUserScreen'
import ResetPasswordScreen from '../screens/ResetPasswordScreen'
import RolloverTeamScreen from './../screens/RolloverTeamScreen'
import TeamGameScreen from '../screens/TeamGamesScreen'
import TeamRequestsScreen from '../screens/TeamRequestsScreen'
import UserRequestsScreen from '../screens/UserRequestsScreen'
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
            <Stack.Screen name="RolloverTeam" component={RolloverTeamScreen} />
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
            <Stack.Screen
                name="UserRequestsScreen"
                component={UserRequestsScreen}
            />
            <Stack.Screen
                name="TeamRequestsScreen"
                component={TeamRequestsScreen}
            />
            <Stack.Screen
                name="JoinByCodeScreen"
                component={JoinByCodeScreen}
            />
            <Stack.Screen name="TeamGames" component={TeamGameScreen} />
            <Stack.Screen name="ActiveGames" component={ActiveGamesScreen} />
            <Stack.Screen
                name="OfflineGameOptions"
                component={OfflineGameOptionsScreen}
            />
        </Stack.Navigator>
    )
}

export default AccountNavigator
