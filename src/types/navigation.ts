import { DisplayTeam } from './team'
import { DisplayUser } from './user'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RequestType } from './request'

export enum SecureEditField {
    EMAIL,
    PASSWORD,
}

export type TopLevelParamList = {
    Tabs: undefined
    SettingsScreen: undefined
    SecureEditScreen: { title: string; value: string; field: SecureEditField }
}

export type AccountStackParamList = {
    Login: undefined
    Profile: undefined
    CreateAccount: undefined
    CreateTeam: undefined
    ForgotPasswordScreen: undefined
    ManageTeams: undefined
    RequestTeam: undefined
    ManagedTeamDetails: { id: string; place: string; name: string }
    PublicTeamDetails: {
        id: string
        place: string
        name: string
        archive?: boolean
    }
    PublicUserDetails: { user: DisplayUser }
    RequestUser: { type: RequestType }
    ResetPasswordScreen: undefined
    RolloverTeam: undefined
    UserRequestsScreen: undefined
    TeamRequestsScreen: undefined
    JoinByCodeScreen: undefined
}

export type GameStackParamList = {
    GameHome: undefined
    GameSearch: { live: string }
    CreateGame: { teamOne: DisplayTeam }
    SelectOpponent: undefined
}

export type AllScreenProps = NativeStackScreenProps<
    AccountStackParamList & TopLevelParamList & GameStackParamList,
    'Tabs'
>

export type TopLevelProps = NativeStackScreenProps<
    TopLevelParamList,
    'SettingsScreen'
>

export type SecureEditProps = NativeStackScreenProps<
    TopLevelParamList,
    'SecureEditScreen'
>

export type Props = NativeStackScreenProps<AccountStackParamList, 'Login'>

export type CreateTeamProps = NativeStackScreenProps<
    AccountStackParamList,
    'CreateTeam'
>
export type ManagedTeamDetailsProps = NativeStackScreenProps<
    AccountStackParamList,
    'ManagedTeamDetails'
>

export type PublicTeamDetailsProps = NativeStackScreenProps<
    AccountStackParamList,
    'PublicTeamDetails'
>

export type PublicUserDetailsProps = NativeStackScreenProps<
    AccountStackParamList,
    'PublicUserDetails'
>

export type RequestUserProps = NativeStackScreenProps<
    AccountStackParamList,
    'RequestUser'
>

export type GameSearchProps = NativeStackScreenProps<
    GameStackParamList,
    'GameSearch'
>

export type CreateGameProps = NativeStackScreenProps<
    GameStackParamList,
    'CreateGame'
>
