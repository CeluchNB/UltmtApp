import { DisplayUser } from './user'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RequestType } from './request'
import {
    CompositeScreenProps,
    NavigatorScreenParams,
} from '@react-navigation/native'
import { DisplayTeam, GuestTeam } from './team'

export enum SecureEditField {
    EMAIL,
    PASSWORD,
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
    ViewGame: { gameId: string }
    Comment: {
        gameId: string
        pointId: string
        live: boolean
    }
}

export type TabParamList = {
    Account: NavigatorScreenParams<AccountStackParamList>
    Games: NavigatorScreenParams<GameStackParamList>
}

export type GameCreationParamList = {
    CreateGame: { teamOne: DisplayTeam; teamTwo: GuestTeam }
    SelectMyTeam: undefined
    SelectOpponent: { initialValue?: string; teamOne: DisplayTeam }
    JoinGame: { teamTwo: DisplayTeam }
}

export type LiveGameParamList = {
    FirstPoint: undefined
    SelectPlayers: undefined // consider passing point id and not relying on live point reducer
    LivePointEdit: undefined
}

export type TopLevelParamList = {
    Tabs: NavigatorScreenParams<TabParamList>
    GameCreationFlow: NavigatorScreenParams<GameCreationParamList>
    LiveGame: NavigatorScreenParams<LiveGameParamList>
    SettingsScreen: undefined
    SecureEditScreen: { title: string; value: string; field: SecureEditField }
}

export type AllScreenProps = NativeStackScreenProps<
    TopLevelParamList &
        TabParamList &
        AccountStackParamList &
        GameStackParamList &
        GameCreationParamList &
        LiveGameParamList,
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

export type ViewGameProps = NativeStackScreenProps<
    GameStackParamList,
    'ViewGame'
>

export type CreateGameProps = CompositeScreenProps<
    NativeStackScreenProps<GameCreationParamList, 'CreateGame'>,
    CompositeScreenProps<
        NativeStackScreenProps<TopLevelParamList>,
        NativeStackScreenProps<LiveGameParamList>
    >
>

export type SelectOpponentProps = NativeStackScreenProps<
    GameCreationParamList,
    'SelectOpponent'
>

export type JoinGameProps = CompositeScreenProps<
    NativeStackScreenProps<GameCreationParamList, 'JoinGame'>,
    CompositeScreenProps<
        NativeStackScreenProps<TopLevelParamList>,
        NativeStackScreenProps<LiveGameParamList>
    >
>

export type LiveGameProps = NativeStackScreenProps<
    LiveGameParamList,
    'FirstPoint'
>

export type CommentProps = NativeStackScreenProps<GameStackParamList, 'Comment'>
