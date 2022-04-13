import { DisplayUser } from './user'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RequestType } from './request'

export type AccountStackParamList = {
    Login: undefined
    Profile: undefined
    CreateAccount: undefined
    CreateTeam: undefined
    ManageTeams: undefined
    RequestTeam: undefined
    ManagedTeamDetails: { id: string; place: string; name: string }
    PublicTeamDetails: { id: string; place: string; name: string }
    PublicUserDetails: { user: DisplayUser }
    RequestUser: { type: RequestType }
    RolloverTeam: { hasPendingRequests: boolean }
}

export type GameStackParamList = {
    GameSearch: undefined
}

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

export type RolloverTeamProps = NativeStackScreenProps<
    AccountStackParamList,
    'RolloverTeam'
>

export type RequestUserProps = NativeStackScreenProps<
    AccountStackParamList,
    'RequestUser'
>
