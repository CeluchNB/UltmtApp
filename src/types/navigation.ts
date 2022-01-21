import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
    Login: undefined
    Profile: undefined
    CreateAccount: undefined
    CreateTeam: { token: string }
}

export type Props = NativeStackScreenProps<RootStackParamList, 'Login'>
export type CreateTeamProps = NativeStackScreenProps<
    RootStackParamList,
    'CreateTeam'
>
