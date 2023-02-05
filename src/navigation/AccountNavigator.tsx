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
import { useTheme } from '../hooks'

const Stack = createNativeStackNavigator<AccountStackParamList>()

const AccountNavigator: React.FC<{}> = () => {
    const {
        theme: { colors },
    } = useTheme()
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
            <Stack.Screen
                name="PublicTeamDetails"
                component={PublicTeamScreen}
                initialParams={{ id: '' }}
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
                    userId: '',
                }}
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
                name="TeamGames"
                component={TeamGameScreen}
                options={{ title: 'Your Games' }}
            />
            <Stack.Screen name="ActiveGames" component={ActiveGamesScreen} />
            <Stack.Screen
                name="OfflineGameOptions"
                component={OfflineGameOptionsScreen}
                options={{ title: '' }}
            />
        </Stack.Navigator>
    )
}

export default AccountNavigator
