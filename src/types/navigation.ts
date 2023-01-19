import { DisplayUser } from './user'
import { GuestTeam } from './team'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RequestType } from './request'
import {
    CompositeScreenProps,
    NavigatorScreenParams,
} from '@react-navigation/native'

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
    TeamGames: undefined
    ActiveGames: undefined
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
    CreateGame: { teamTwo: GuestTeam }
    SelectMyTeam: undefined
    SelectOpponent: { initialValue?: string }
    JoinGame: undefined
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

export type SettingsScreenProps = CompositeScreenProps<
    NativeStackScreenProps<TopLevelParamList, 'SettingsScreen'>,
    NativeStackScreenProps<AllScreenProps>
>

export type SecureEditProps = NativeStackScreenProps<
    TopLevelParamList,
    'SecureEditScreen'
>

// Account
export type ProfileProps = CompositeScreenProps<
    NativeStackScreenProps<AccountStackParamList, 'Profile'>,
    NativeStackScreenProps<TopLevelParamList>
>
export type LoginProps = NativeStackScreenProps<AccountStackParamList, 'Login'>
export type CreateAccountProps = NativeStackScreenProps<
    AccountStackParamList,
    'CreateAccount'
>
export type CreateTeamProps = NativeStackScreenProps<
    AccountStackParamList,
    'CreateTeam'
>
export type ManageTeamsProps = NativeStackScreenProps<
    AccountStackParamList,
    'ManageTeams'
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
export type RequestTeamProps = NativeStackScreenProps<
    AccountStackParamList,
    'RequestTeam'
>
export type RolloverTeamProps = NativeStackScreenProps<
    AccountStackParamList,
    'RolloverTeam'
>
export type ForgotPasswordProps = NativeStackScreenProps<
    AccountStackParamList,
    'ForgotPasswordScreen'
>
export type ResetPasswordProps = NativeStackScreenProps<
    AccountStackParamList,
    'ResetPasswordScreen'
>
export type UserRequestProps = NativeStackScreenProps<
    AccountStackParamList,
    'UserRequestsScreen'
>
export type TeamRequestProps = NativeStackScreenProps<
    AccountStackParamList,
    'TeamRequestsScreen'
>
export type JoinByCodeProps = NativeStackScreenProps<
    AccountStackParamList,
    'JoinByCodeScreen'
>

// Game Stack
export type GameHomeProps = CompositeScreenProps<
    NativeStackScreenProps<GameStackParamList, 'GameHome'>,
    NativeStackScreenProps<TopLevelParamList>
>

export type GameSearchProps = NativeStackScreenProps<
    GameStackParamList,
    'GameSearch'
>
export type ViewGameProps = NativeStackScreenProps<
    GameStackParamList,
    'ViewGame'
>
export type CommentProps = NativeStackScreenProps<GameStackParamList, 'Comment'>

// Game Creation Flow
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
export type SelectMyTeamProps = CompositeScreenProps<
    NativeStackScreenProps<GameCreationParamList, 'SelectMyTeam'>,
    CompositeScreenProps<
        NativeStackScreenProps<TopLevelParamList>,
        NativeStackScreenProps<LiveGameParamList>
    >
>

// Live Game
export type FirstPointProps = NativeStackScreenProps<
    LiveGameParamList,
    'FirstPoint'
>
export type SelectPlayersProps = NativeStackScreenProps<
    LiveGameParamList,
    'SelectPlayers'
>
export type LivePointEditProps = CompositeScreenProps<
    NativeStackScreenProps<LiveGameParamList, 'LivePointEdit'>,
    NativeStackScreenProps<TopLevelParamList>
>

export type TeamGameProps = CompositeScreenProps<
    NativeStackScreenProps<AccountStackParamList, 'TeamGames'>,
    NativeStackScreenProps<TopLevelParamList>
>
export type ActiveGamesProps = CompositeScreenProps<
    NativeStackScreenProps<AccountStackParamList, 'ActiveGames'>,
    NativeStackScreenProps<TopLevelParamList>
>
