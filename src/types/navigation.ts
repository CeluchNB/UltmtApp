import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
    Login: undefined
    Profile: undefined
    CreateAccount: undefined
    CreateTeam: undefined
    ManageTeams: undefined
    RequestTeam: undefined
    ManagedTeamDetails: { id: string; place: string; name: string }
    PublicTeamDetails: { id: string; place: string; name: string }
    RequestUser: { id: string }
    RolloverTeam: { id: string }
}

export type Props = NativeStackScreenProps<RootStackParamList, 'Login'>
export type CreateTeamProps = NativeStackScreenProps<
    RootStackParamList,
    'CreateTeam'
>
export type ManagedTeamDetailsProps = NativeStackScreenProps<
    RootStackParamList,
    'ManagedTeamDetails'
>

export type PublicTeamDetailsProps = NativeStackScreenProps<
    RootStackParamList,
    'PublicTeamDetails'
>
