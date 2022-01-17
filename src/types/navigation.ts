import { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
    Login: undefined
    Profile: undefined
    CreateAccount: undefined
}

export type Props = NativeStackScreenProps<RootStackParamList, 'Login'>
