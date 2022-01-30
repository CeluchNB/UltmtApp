import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
    Login: undefined
    Profile: undefined
    CreateAccount: undefined
    CreateTeam: undefined
    ManageTeams: undefined
    RequestTeam: undefined
    TeamDetails: { id: string; place: string; name: string }
}

export type Props = NativeStackScreenProps<RootStackParamList, 'Login'>
export type CreateTeamProps = NativeStackScreenProps<
    RootStackParamList,
    'CreateTeam'
>
export type TeamDetailsProps = NativeStackScreenProps<
    RootStackParamList,
    'TeamDetails'
>
