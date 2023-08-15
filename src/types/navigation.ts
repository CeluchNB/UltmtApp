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
    ForgotPassword: undefined
    ManageTeams: undefined
    RequestTeam: undefined
    ManagedTeamDetails: { id: string }
    PublicTeamDetails: {
        id: string
        archive?: boolean
    }
    PublicUserDetails: {
        userId: string
        tab?: 'games' | 'stats'
    }
    RequestUser: { type: RequestType }
    ResetPassword: undefined
    RolloverTeam: undefined
    UserRequests: undefined
    TeamRequests: undefined
    JoinByCode: undefined
    TeamGames: undefined
    ActiveGames: undefined
    OfflineGameOptions: { gameId: string }
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
    GameStats: { gameId: string }
}

export type TabParamList = {
    Account: NavigatorScreenParams<AccountStackParamList>
    Games: NavigatorScreenParams<GameStackParamList>
}

export type LiveGameParamList = {
    FirstPoint: undefined
    SelectPlayers: undefined // consider passing point id and not relying on live point reducer
    LivePointEdit: undefined
    EditGame: undefined
}

export type TopLevelParamList = {
    Tabs: NavigatorScreenParams<TabParamList>
    CreateGame: { teamTwo: GuestTeam }
    SelectMyTeam: undefined
    SelectOpponent: { initialValue?: string }
    SearchTournaments: undefined
    CreateTournament: { name?: string }
    JoinGame: undefined
    LiveGame: NavigatorScreenParams<LiveGameParamList>
    Settings: undefined
    SecureEdit: { title: string; value: string; field: SecureEditField }
    Information: undefined
}

export type AllScreenProps = NativeStackScreenProps<
    TopLevelParamList &
        TabParamList &
        AccountStackParamList &
        GameStackParamList &
        // GameCreationParamList &
        LiveGameParamList,
    'Tabs'
>

export type SettingsScreenProps = CompositeScreenProps<
    NativeStackScreenProps<TopLevelParamList, 'Settings'>,
    NativeStackScreenProps<AllScreenProps>
>

export type SecureEditProps = NativeStackScreenProps<
    TopLevelParamList,
    'SecureEdit'
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
    'ForgotPassword'
>
export type ResetPasswordProps = NativeStackScreenProps<
    AccountStackParamList,
    'ResetPassword'
>
export type UserRequestProps = NativeStackScreenProps<
    AccountStackParamList,
    'UserRequests'
>
export type TeamRequestProps = NativeStackScreenProps<
    AccountStackParamList,
    'TeamRequests'
>
export type JoinByCodeProps = NativeStackScreenProps<
    AccountStackParamList,
    'JoinByCode'
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
export type GameStatsProps = NativeStackScreenProps<
    GameStackParamList,
    'GameStats'
>

// Game Creation Flow
export type CreateGameProps = CompositeScreenProps<
    NativeStackScreenProps<TopLevelParamList, 'CreateGame'>,
    NativeStackScreenProps<AllScreenProps>
>
export type SelectOpponentProps = NativeStackScreenProps<
    TopLevelParamList,
    'SelectOpponent'
>
export type JoinGameProps = CompositeScreenProps<
    NativeStackScreenProps<TopLevelParamList, 'JoinGame'>,
    CompositeScreenProps<
        NativeStackScreenProps<TopLevelParamList>,
        NativeStackScreenProps<LiveGameParamList>
    >
>
export type SelectMyTeamProps = CompositeScreenProps<
    NativeStackScreenProps<TopLevelParamList, 'SelectMyTeam'>,
    CompositeScreenProps<
        NativeStackScreenProps<TopLevelParamList>,
        NativeStackScreenProps<LiveGameParamList>
    >
>
export type SearchTournamentProps = NativeStackScreenProps<
    TopLevelParamList,
    'SearchTournaments'
>
export type CreateTournamentProps = NativeStackScreenProps<
    TopLevelParamList,
    'CreateTournament'
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
export type EditGameProps = NativeStackScreenProps<
    LiveGameParamList,
    'EditGame'
>

export type TeamGameProps = CompositeScreenProps<
    NativeStackScreenProps<AccountStackParamList, 'TeamGames'>,
    NativeStackScreenProps<TopLevelParamList>
>
export type ActiveGamesProps = CompositeScreenProps<
    NativeStackScreenProps<AccountStackParamList, 'ActiveGames'>,
    NativeStackScreenProps<TopLevelParamList>
>
export type OfflineGameOptionsProps = NativeStackScreenProps<
    AccountStackParamList,
    'OfflineGameOptions'
>

declare global {
    namespace ReactNavigation {
        interface RootParamList extends TopLevelParamList {}
    }
}
